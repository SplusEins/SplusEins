<template>
  <v-stepper
    v-model="stepperEl"
    vertical
  >
    <v-stepper-header>
      <h2 class="text-h5 pl-6 pt-5">
        SplusEins einrichten
      </h2>
    </v-stepper-header>
    <v-stepper-step
      :complete="stepperEl > 1"
      step="1"
      editable
    >
      Fakultät auswählen
    </v-stepper-step>
    <v-stepper-content
      step="1"
      justify="start"
      class="d-flex"
      style="max-width: 500px;"
    >
      <v-container class="pl-0">
        <v-row
          dense
        >
          <v-col cols=auto>
            <v-select
              v-model="selectedPath"
              :items="paths"
              label="Fakultät"
              filled
            />
          </v-col>
        </v-row>
      </v-container>

      <v-btn
        color="primary"
        @click="stepperEl = 2"
        :disabled="!step2Enabled"
      >
        Weiter
      </v-btn>
      <v-btn
        text
        @click="setSetupCompleted(true)"
      >
        Einrichtung Überspringen
      </v-btn>
    </v-stepper-content>

    <v-stepper-step
      :complete="stepperEl > 2"
      step="2"
      :editable="step2Enabled"
      justify="start"
      class="d-flex"
      style="max-width: 500px;"
    >
      Einen Plan auswählen
    </v-stepper-step>

    <v-stepper-content step="2">
      <v-container class="pl-0">
        <v-row
          dense
        >
          <v-col cols=auto>
            <v-select
              v-model="selectedSemester"
              :items="semesters"
              label="Semester"
              filled
            />
          </v-col>
          <v-col cols=auto>
            <v-select
              v-model="selectedSchedule"
              :disabled="!schedules || schedules.length == 0"
              :items="schedules"
              label="Vertiefung"
              item-text="label"
              return-object
              filled
            />
          </v-col>
        </v-row>
      </v-container>

      <v-btn
        color="primary"
        @click="saveFavorite()"
        :disabled="!step3Enabled"
      >
        Fertigstellen
      </v-btn>
      <v-btn
        text
        @click="stepperEl = 3"
        :disabled="!step3Enabled"
      >
        Plan personalisieren
      </v-btn>
    </v-stepper-content>

    <v-stepper-step
      step="3"
      :editable="step3Enabled"
    >
      Plan personalisieren
      <small>Optional</small>
    </v-stepper-step>

    <v-stepper-content
      step="3"
      justify="start"
      class="d-flex"
    >
      <v-container style="max-width: 800px;">
        <course-multiselect
          v-if="stepperEl == 3"
          v-model="selectedLectures"
          max-courses=30
          :lectures="lectures"
        />
      </v-container>

      <v-btn
        color="primary"
        @click="saveCustom()"
      >
        Personalisierten Plan speichern
      </v-btn>
    </v-stepper-content>
  </v-stepper>
</template>

<script>
import { mapMutations, mapGetters } from 'vuex';
import { loadUniqueLectures, eventsAsLectures } from '../store/splus';
import { uniq, customTimetableToRoute, timetableToRoute } from '../lib/util';

export default {
  name: 'IntroductionStepper',
  data () {
    return {
      selectedSchedule: undefined,
      selectedPath: undefined,
      selectedSemester: undefined,
      stepperEl: 1,
      maxCourses: 30,
      selectedLectures: [],
      lectures: []
    }
  },
  computed: {
    paths () {
      return Object.keys(this.schedulesTree);
    },
    semesters () {
      return this.schedulesTree[this.selectedPath] != null
        ? Object.keys(this.schedulesTree[this.selectedPath])
        : [];
    },
    schedules () {
      return this.schedulesTree[this.selectedPath] != null
        ? this.schedulesTree[this.selectedPath][this.selectedSemester] || []
        : [];
    },
    step2Enabled () {
      return this.selectedPath != null
    },
    step3Enabled () {
      return this.selectedSchedule != null
    },
    ...mapGetters({
      schedulesTree: 'splus/getTimetablesAsTree'
    })
  },
  watch: {
    selectedPath () {
      if (this.semesters.length === 1) this.selectedSemester = this.semesters[0];
      else this.selectedSemester = undefined;
    },
    selectedSemester () {
      if (this.schedules.length === 1) this.selectedSchedule = this.schedules[0];
      else this.selectedSchedule = undefined;
    },
    selectedSchedule () {
      this.loadLectures(this.selectedSchedule);
    }
  },
  methods: {
    ...mapMutations({
      addFavoriteSchedule: 'splus/addFavoriteSchedule',
      setSetupCompleted: 'setSetupCompleted'
    }),
    async loadLectures (schedule) {
      try {
        const events = await loadUniqueLectures(schedule, this.$axios.$get);
        this.lectures = eventsAsLectures(events);
        this.selectedLectures = this.lectures; // preselect all
      } catch (error) {
        this.enqueueError('Stundenplan: API-Verbindung fehlgeschlagen');
        console.error('error during API call', error.message);
      }
    },
    saveCustom () {
      // Set the base schedule and filters matching the given courses.
      const titleIds = uniq(this.selectedLectures.map(({ titleId }) => titleId));

      const customScheduleRoute = customTimetableToRoute({
        id: this.selectedSchedule.id,
        label: 'Mein Plan',
        whitelist: titleIds
      });
      this.setSetupCompleted(true)
      this.$router.push(customScheduleRoute);
    },
    saveFavorite () {
      this.addFavoriteSchedule(this.selectedSchedule);
      this.setSetupCompleted(true)
      this.$router.push(timetableToRoute(this.selectedSchedule));
    }
  }
};
</script>
