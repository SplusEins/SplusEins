<template>
  <v-dialog
    v-model="dialogOpen"
    :fullscreen="$vuetify.breakpoint.mobile"
    max-width="800px"
    hide-overlay
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-toolbar
        dark
        color="primary"
      >
        <v-btn
          icon
          dark
          @click.native="dialogOpen = false"
        >
          <v-icon>{{ mdiClose }}</v-icon>
        </v-btn>
        <v-toolbar-title>Neuer Stundenplan</v-toolbar-title>
        <v-spacer />
        <v-toolbar-items>
          <v-btn
            :disabled="!saveable"
            dark
            text
            @click.native="save()"
          >
            Speichern
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-form
        v-model="valid"
        class="pa-2"
      >
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="selectedName"
                :rules="[rules.required, rules.uniqueScheduleLabel, isNew ? rules.uniqueCustomScheduleLabel : true]"
                label="Plan benennen"
                single-line
                required
                autofocus
              />
            </v-col>

            <v-col cols="12">
              <timetable-select
                v-show="selectedSchedules.length <= maxSchedules"
                :selected-schedules="selectedSchedules"
                :loading="loading"
                @input="addSchedule"
              />
            </v-col>

            <v-col cols="12">
              <v-chip
                v-for="schedule in selectedSchedules"
                :key="schedule.id"
                close
                @click:close="removeSchedule(schedule)"
                class="mr-1"
              >
                {{ getFormattedName(schedule) }}
              </v-chip>
            </v-col>

            <v-col cols="12">
              <course-multiselect
                v-show="selectedSchedules.length > 0"
                v-model="selectedCourses"
                :max-courses="maxCourses"
                :lectures="allLectures"
              />
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapMutations, mapGetters } from 'vuex';
import { uniq, flatten, customTimetableToRoute } from '../lib/util';
import { loadUniqueLectures, eventsAsLectures } from '../store/splus';
import TimetableSelect from './timetable-select.vue';
import CourseMultiselect from './course-multiselect.vue';
import { mdiClose } from '@mdi/js'

export default {
  name: 'CustomTimetableDialog',
  components: {
    TimetableSelect,
    CourseMultiselect
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    customSchedule: {
      type: Object,
      default: () => undefined
    }
  },
  data () {
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
          (value) => !this.scheduleIds.includes(value) ||
                     'Bereits vergeben',
        uniqueCustomScheduleLabel:
          (value) => !this.customScheduleLabels.includes(value) ||
                     'Bereits vergeben'
      },
      // reasonable limits to ensure good performance
      // and a usable UI
      maxSchedules: 8,
      maxCourses: 20,
      mdiClose
    };
  },
  computed: {
    dialogOpen: {
      get () { return this.value; },
      set (value) { this.$emit('input', value); }
    },
    saveable () {
      return this.valid && this.selectedCourses.length > 0;
    },
    isNew () {
      return !this.customSchedule;
    },
    allLectures () {
      return flatten(Object.values(this.lectures));
    },
    ...mapGetters({
      schedulesTree: 'splus/getTimetablesAsTree',
      customScheduleLabels: 'splus/customTimetableLabels',
      scheduleIds: 'splus/timetableIds',
      getScheduleById: 'splus/getTimetableById'
    })
  },
  watch: {
    dialogOpen () {
      if (this.dialogOpen) {
        if (!this.isNew) {
          this.load();
        }
      }
    }
  },
  methods: {
    getFormattedName (schedule) {
      for (const element of this.selectedSchedules) {
        if ((schedule.label == element.label) && (schedule.semester != element.semester)) {
          return schedule.label + ' (' + schedule.semester + '. Sem)';
        }
      }
      return schedule.label;
    },
    async addSchedule (schedule) {
      if (this.selectedSchedules.includes(schedule)) {
        return;
      }

      this.selectedSchedules.push(schedule);
      await this.loadLectures(schedule);
    },
    removeSchedule (schedule) {
      const index = this.selectedSchedules.indexOf(schedule);
      this.selectedSchedules.splice(index, 1);
      const titles = this.lectures[schedule.id].map(lecture => lecture.title)
      this.$set(this.lectures, schedule.id, []);
      this.selectedCourses = this.selectedCourses.filter(
        (course) => !titles.includes(course.title));
    },
    async loadLectures (schedule) {
      this.loading = true;

      try {
        const events = await loadUniqueLectures(schedule, this.$axios.$get);
        const lectures = eventsAsLectures(events);
        this.$set(this.lectures, schedule.id, lectures);
      } catch (error) {
        this.enqueueError('Stundenplan: API-Verbindung fehlgeschlagen');
        console.error('error during API call', error.message);
      }

      this.loading = false;
    },
    /**
     * Store the edited schedule.
     */
    save () {
      this.dialogOpen = false;

      // Set the base schedule and filters matching the given courses.
      const titleIds = uniq(this.selectedCourses.map(({ titleId }) => titleId));

      const customScheduleRoute = customTimetableToRoute({
        id: this.selectedSchedules.map(({ id }) => id),
        label: this.selectedName,
        whitelist: titleIds
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
    async load () {
      this.selectedName = this.customSchedule.label;

      await Promise.all(this.customSchedule.id.map(async (id) =>
        await this.addSchedule(this.getScheduleById(id)))
      );

      const getCourseById = (id) => flatten(Object.values(this.lectures)).find(
        ({ titleId }) => titleId == id);
      this.selectedCourses = this.customSchedule.whitelist.map(getCourseById);
    },
    ...mapMutations({
      enqueueError: 'enqueueError',
      deleteCustomSchedule: 'splus/deleteCustomSchedule'
    })
  }
};
</script>
