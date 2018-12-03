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
            @click.native="save(); trackMatomoEvent('Menu','saveCustomTimetable',' Anzahl Pläne:',selectedSchedules.length ); trackMatomoEvent('Menu','saveCustomTimetable','Anzahl Kurse:', selectedCourses.length)">Speichern</v-btn>
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
                :rules="[rules.required, rules.uniqueScheduleLabel, isNew ? rules.uniqueCustomScheduleLabel : true]"
                label="Plan benennen"
                single-line
                required
                autofocus />
            </v-flex>

            <v-flex xs12>
              <timetable-select
                v-show="selectedSchedules.length <= maxSchedules"
                :loading="loading"
                @input="addSchedule" />
            </v-flex>

            <v-flex xs12>
              <v-chip
                v-for="schedule in selectedSchedules"
                :key="schedule.id"
                close
                @input="removeSchedule(schedule)">
                {{ schedule.label + ' (' +schedule.semester + '. Sem)' }}
              </v-chip>
            </v-flex>

            <v-flex xs12>
              <course-multiselect
                v-show="selectedSchedules.length > 0"
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
import { uniq, flatten, customScheduleToRoute } from '../store/splus';
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
    customSchedule: {
      type: Object,
      default: () => undefined
    },
  },
  data() {
    return {
      /* user data */
      selectedName: '',
      selectedSchedules: [],
      selectedCourses: [],
      lectures: {},
      /* state */
      loading: false,
      valid: false,
      /* constants */
      rules: {
        required: (value) => !!value || 'Pflichtfeld',
        uniqueScheduleLabel:
          (value) => !this.scheduleIds.includes(value)
                     || 'Bereits vergeben',
        uniqueCustomScheduleLabel:
          (value) => !this.customScheduleLabels.includes(value)
                     || 'Bereits vergeben',
      },
      // reasonable limits to ensure good performance
      // and a usable UI
      maxSchedules: 5,
      maxCourses: 20,
    };
  },
  computed: {
    dialogOpen: {
      get() { return this.value; },
      set(value) { this.$emit('input', value); }
    },
    isNew() {
      return !this.customSchedule;
    },
    courses() {
      const allLectures = [].concat(...Object.values(this.lectures));
      const uniqueLectures = new Map();
      allLectures.forEach(
        (lecture) => uniqueLectures.set(lecture.titleId, lecture));
      return [...uniqueLectures.values()].sort();
    },
    ...mapGetters({
      schedulesTree: 'splus/getSchedulesAsTree',
      customScheduleLabels: 'splus/customScheduleLabels',
      scheduleIds: 'splus/scheduleIds',
      getScheduleById: 'splus/getScheduleById',
    }),
  },
  watch: {
    dialogOpen() {
      if(this.dialogOpen){
        if (!this.isNew) {
          this.load();
        }
      }
    }
  },
  methods: {
    trackMatomoEvent (category, action , name, value) {
      this.$matomo.trackEvent(category, action, name,value);
    },
    async addSchedule(schedule) {
      if (this.selectedSchedules.includes(schedule)) {
        return;
      }

      this.selectedSchedules.push(schedule);
      await this.loadLectures(schedule);
    },
    removeSchedule(schedule) {
      const index = this.selectedSchedules.indexOf(schedule);
      this.selectedSchedules.splice(index, 1);
      this.$set(this.lectures, schedule.id, []);
      this.selectedCourses = this.selectedCourses.filter(
        (course) => course.id == schedule.id);
    },
    async loadLectures(schedule) {
      this.loading = true;

      const week = moment().isoWeek();

      try {
        const responses = [
          await this.$axios.get(`/api/splus/${schedule.id}/${week}`),
          await this.$axios.get(`/api/splus/${schedule.id}/${week+1}`),
          await this.$axios.get(`/api/splus/${schedule.id}/${week+2}`),
          await this.$axios.get(`/api/splus/${schedule.id}/${week+3}`),
        ];
        const uniqueLectures = flatten(responses.map(({ data }) => data))
          .filter((lecture, index, self) => self.indexOf(lecture) == index);
        this.$set(this.lectures, schedule.id, uniqueLectures);
      } catch (error) {
        this.setError('API-Verbindung fehlgeschlagen');
        console.error('error during API call', error.message);
      }

      this.loading = false;
    },
    /**
     * Store the edited schedule.
     */
    save() {
      this.dialogOpen = false;

      // Set the base schedule and filters matching the given courses.
      const titleIds = uniq(this.selectedCourses.map(({ titleId }) => titleId));

      const customScheduleRoute = customScheduleToRoute({
        id: this.selectedSchedules.map(({ id }) => id ),
        label: this.selectedName,
        whitelist: titleIds,
      });

      if (!this.isNew) {
        this.deleteCustomSchedule(this.customSchedule);
        this.$router.replace(customScheduleRoute);
      } else {
        this.$router.push(customScheduleRoute);
      }
    },
    /**
     * Load the state from a passed schedule.
     */
    async load() {
      this.selectedName = this.customSchedule.label;

      await Promise.all(this.customSchedule.id.map(async (id) =>
        await this.addSchedule(this.getScheduleById(id)))
      );

      const getCourseById = (id) => flatten(Object.values(this.lectures)).find(
        ({ titleId }) => titleId == id);
      this.selectedCourses = this.customSchedule.whitelist.map(getCourseById);
    },
    ...mapMutations({
      setError: 'splus/setError',
      deleteCustomSchedule: 'splus/deleteCustomSchedule',
    }),
  },
};
</script>
