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
                :rules="[rules.required, rules.uniqueCustomScheduleLabel]"
                label="Plan benennen"
                single-line
                required
                autofocus />
            </v-flex>

            <v-flex xs12>
              <timetable-select @input="addSchedule" />
            </v-flex>

            <v-flex xs12>
              <v-chip
                v-for="schedule in selectedSchedules"
                :key="schedule.id"
                close
                @input="removeSchedule(schedule)">
                {{ schedule.label }}
              </v-chip>
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
import { uniq, customScheduleToRoute } from '../store/splus';
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
      selectedSchedules: [],
      selectedCourses: [],
      lectures: {},
      valid: false,
      rules: {
        required: (value) => !!value || 'Pflichtfeld',
        uniqueCustomScheduleLabel:
          (value) => !this.customScheduleLabels.includes(value)
                     || 'Bereits vergeben',
      },
    };
  },
  computed: {
    dialogOpen: {
      get() { return this.value; },
      set(value) { this.$emit('input', value); }
    },
    courses() {
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
      customScheduleLabels: 'splus/customScheduleLabels',
    }),
  },
  methods: {
    addSchedule(schedule) {
      this.selectedSchedules.push(schedule);
      this.loadLectures(schedule);
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
        const response = await this.$axios.get(`/api/splus/${schedule.id}/${week}`);
        this.$set(this.lectures, schedule.id, response.data);
      } catch (error) {
        this.setError('API-Verbindung fehlgeschlagen');
        console.error('error during API call', error.message);
      }

      this.loading = false;
    },
    save() {
      this.dialogOpen = false;

      // Set the base schedule and filters matching the given courses.
      const titleIds = uniq(this.selectedCourses.map(({ titleId }) => titleId));

      const customSchedule = {
        id: this.selectedSchedules.map(({ id }) => id ),
        label: this.selectedName,
        whitelist: titleIds,
      };

      this.$router.push(customScheduleToRoute(customSchedule));
    },
    ...mapMutations({
      setError: 'splus/setError',
    }),
  },
};
</script>
