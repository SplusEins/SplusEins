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
                :rules="[rules.required]"
                label="Plan benennen"
                single-line
                required
                autofocus />
            </v-flex>

            <v-flex xs12>
              <timetable-select v-model="selectedSchedule"/>
            </v-flex>

            <v-flex xs12>
              <course-multiselect
                v-model="selectedCourses"
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
import { mapMutations, mapState, mapGetters } from 'vuex';
import * as moment from 'moment';
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
    }
  },
  data() {
    return {
      loading: false,
      selectedName: '',
      selectedSchedule: undefined,
      selectedCourses: [],
      lectures: [],
      valid: false,
      rules: {
        required: (value) => !!value || 'Pflichtfeld',
      },
    };
  },
  computed: {
    dialogOpen: {
      get() { return this.value; },
      set(value) { this.$emit('input', value); }
    },
    courses() {
      if (!this.selectedSchedule) {
        return [];
      }

      const allLectures = [].concat(...Object.values(this.lectures));
      const uniqueLectures = new Map();
      allLectures.forEach(
        (lecture) => uniqueLectures.set(lecture.titleId, lecture));
      return [...uniqueLectures.values()];
    },
    ...mapState({
      customSchedule: (state) => state.splus.customSchedule,
    }),
    ...mapGetters({
      schedulesTree: 'splus/getSchedulesAsTree',
    }),
  },
  watch: {
    async selectedSchedule(newSchedule, oldSchedule) {
      if (newSchedule != oldSchedule) {
        this.lectures = [];
      }
      if (!newSchedule) {
        return;
      }

      this.loading = true;
      await this.loadLectures(newSchedule);
      this.loading = false;
    }
  },
  methods: {
    async loadLectures(schedule) {
      const week = moment().isoWeek();

      try {
        const response = await this.$axios.get(`/api/splus/${schedule.id}/${week}`);
        // select all courses by default
        this.selectedCourses = this.lectures = response.data;
      } catch (error) {
        this.setError('API-Verbindung fehlgeschlagen');
        console.error('error during API call', error.message);
      }
    },
    save() {
      this.dialogOpen = false;
      this.setCustomSchedule({
        schedule: this.selectedSchedule,
        courses: this.selectedCourses,
        name: this.selectedName,
      });
      this.setSchedule(this.customSchedule);
    },
    ...mapMutations({
      setError: 'splus/setError',
      setCustomSchedule: 'splus/setCustomSchedule',
      setSchedule: 'splus/setSchedule',
    }),
  }
};
</script>
