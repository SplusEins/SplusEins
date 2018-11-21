<template>
  <v-dialog
    v-model="dialogOpen"
    :fullscreen="$vuetify.breakpoint.smAndDown"
    max-width="800px"
    hide-overlay
    transition="dialog-bottom-transition">
    <v-card>
      <v-toolbar
        dark
        color="primary">
        <v-btn
          icon
          dark
          @click.native="dialogOpen = false">
          <v-icon>close</v-icon>
        </v-btn>
        <v-toolbar-title>Neuer Stundenplan</v-toolbar-title>
        <v-spacer />
        <v-toolbar-items>
          <v-btn
            :disabled="!valid"
            dark
            flat
            @click.native="save()">Speichern</v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-form v-model="valid">
        <v-container grid-list-md>
          <v-layout
            row
            wrap>
            <v-flex xs12>
              <v-text-field
                v-model="selectedName"
                :rules="[rules.required, rules.uniqueTimetableLabel, isNew ? rules.uniqueCustomTimetableLabel : true]"
                label="Plan benennen"
                single-line
                required
                autofocus />
            </v-flex>

            <v-flex xs12>
              <timetable-select
                v-show="selectedTimetables.length <= maxTimetables"
                :loading="loading"
                @input="addTimetable" />
            </v-flex>

            <v-flex xs12>
              <v-chip
                v-for="timetable in selectedTimetables"
                :key="timetable.id"
                close
                @input="removeTimetable(timetable)">
                {{ timetable.label }}
              </v-chip>
            </v-flex>

            <v-flex xs12>
              <course-multiselect
                v-model="selectedCourses"
                :max-courses="maxCourses"
                :courses="courses"
                :loading="loading" />
            </v-flex>
          </v-layout>
        </v-container>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script lang="js">
import { mapMutations, mapGetters } from 'vuex';
import * as moment from 'moment';
import { uniq, flatten, customTimetableToRoute } from '../store/splus';
import TimetableSelect from './timetable-select.vue';
import CourseMultiselect from './course-multiselect.vue';

export default {
  name: 'CustomTimetableDialog',
  components: {
    TimetableSelect,
    CourseMultiselect,
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    customTimetable: {
      type: Object,
      default: () => undefined
    },
  },
  data() {
    return {
      /* user data */
      selectedName: '',
      selectedTimetables: [],
      selectedCourses: [],
      lectures: {},
      /* state */
      loading: false,
      valid: false,
      /* constants */
      rules: {
        required: (value) => !!value || 'Pflichtfeld',
        uniqueTimetableLabel:
          (value) => !this.timetableIds.includes(value)
                     || 'Bereits vergeben',
        uniqueCustomTimetableLabel:
          (value) => !this.customTimetableLabels.includes(value)
                     || 'Bereits vergeben',
      },
      // reasonable limits to ensure good performance
      // and a usable UI
      maxTimetables: 5,
      maxCourses: 20,
    };
  },
  computed: {
    dialogOpen: {
      get() { return this.value; },
      set(value) { this.$emit('input', value); }
    },
    isNew() {
      return !this.customTimetable;
    },
    courses() {
      const allLectures = [].concat(...Object.values(this.lectures));
      const uniqueLectures = new Map();
      allLectures.forEach(
        (lecture) => uniqueLectures.set(lecture.titleId, lecture));
      return [...uniqueLectures.values()].sort();
    },
    ...mapGetters({
      timetablesTree: 'splus/getTimetablesAsTree',
      customTimetableLabels: 'splus/customTimetableLabels',
      timetableIds: 'splus/timetableIds',
      getTimetableById: 'splus/getTimetableById',
    }),
  },
  mounted() {
    if (!this.isNew) {
      this.load();
    }
  },
  methods: {
    async addTimetable(timetable) {
      if (this.selectedTimetables.includes(timetable)) {
        return;
      }

      this.selectedTimetables.push(timetable);
      await this.loadLectures(timetable);
    },
    removeTimetable(timetable) {
      const index = this.selectedTimetables.indexOf(timetable);
      this.selectedTimetables.splice(index, 1);
      this.$set(this.lectures, timetable.id, []);
      this.selectedCourses = this.selectedCourses.filter(
        (course) => course.id == timetable.id);
    },
    async loadLectures(timetable) {
      this.loading = true;

      const week = moment().isoWeek();

      try {
        const response = await this.$axios.get(`/api/splus/${timetable.id}/${week}`);
        this.$set(this.lectures, timetable.id, response.data);
      } catch (error) {
        this.setError('API-Verbindung fehlgeschlagen');
        console.error('error during API call', error.message);
      }

      this.loading = false;
    },
    /**
     * Store the edited timetable.
     */
    save() {
      this.dialogOpen = false;

      // Set the base timetable and filters matching the given courses.
      const titleIds = uniq(this.selectedCourses.map(({ titleId }) => titleId));

      const customTimetable = {
        id: this.selectedTimetables.map(({ id }) => id ),
        label: this.selectedName,
        whitelist: titleIds,
      };

      if (!this.isNew) {
        this.deleteCustomTimetable(this.customTimetable);
      }

      this.$router.push(customTimetableToRoute(customTimetable));
    },
    /**
     * Load the state from a passed timetable.
     */
    async load() {
      this.selectedName = this.customTimetable.label;

      await Promise.all(this.customTimetable.id.map(async (id) =>
        await this.addTimetable(this.getTimetableById(id)))
      );

      const getCourseById = (id) => flatten(Object.values(this.lectures)).find(
        ({ titleId }) => titleId == id);
      this.selectedCourses = this.customTimetable.whitelist.map(getCourseById);
    },
    ...mapMutations({
      setError: 'splus/setError',
      deleteCustomTimetable: 'splus/deleteCustomTimetable',
    }),
  },
};
</script>
