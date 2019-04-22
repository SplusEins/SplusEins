<template>
  <v-card>
    <v-card-title>
      <h3 class="headline">
        Nächste Vorlesung
      </h3>
    </v-card-title>

    <v-card-text>
      <ul
        v-if="nextEvent != undefined"
        class="event-description"
      >
        <li>{{ nextEvent.title }} {{ nextEvent.meta.organiserName }}</li>
        <li>Datum: {{ nextEvent.start.format('dddd, DD.MM.YYYY') }}</li>
        <li>Uhrzeit: {{ nextEvent.start.format('HH:mm') }} Uhr</li>
        <li v-if="!!nextEvent.location">
          Raum: {{ nextEvent.location }}
        </li>
      </ul>
      <span v-else-if="hasSubscribableTimetables">Keine weiteren Vorlesungen in dieser Woche.</span>
      <span v-else>Markiere Favoriten oder erstelle personalisierte Pläne, um diese Option nutzen zu können.</span>
    </v-card-text>

    <select-dialog
      :open.sync="dialogOpen"
      :items="subscribableTimetables"
      :selected.sync="selectedItem"
      title="Plan wählen"
    />

    <v-card-actions>
      <v-spacer />
      <v-btn
        v-show="hasManySubscribableTimetables"
        color="primary"
        flat
        @click="dialogOpen = true; $track('Calendar', 'openSelectTimetable')"
      >
        Plan wählen
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import * as moment from 'moment';
import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
import SelectDialog from './select-dialog.vue'

export default {
  name: 'UpcomingLecturesCard',
  components: {
    SelectDialog,
  },
  data() {
    return {
      dialogOpen: false,
    }
  },
  computed: {
    selectedItem: {
      get(){ return this.subscribedTimetable; },
      set(value){ this.selectSubscribedTimetable(value); }
    },
    nextEvent() {
      const now = moment();
      const isInFuture = (event) => event.start.valueOf() - now.valueOf() > 0;

      const futureEvents = this.upcomingEvents
        .map((event) => ({
          ...event,
          start: moment(event.start),
        }))
        .filter(isInFuture)
        .sort((a, b) => a.start.valueOf() - b.start.valueOf());

      return futureEvents.length > 0 ? futureEvents[0] : undefined;
    },
    hasManySubscribableTimetables() {
      return this.subscribableTimetables.length > 1;
    },
    ...mapState({
      upcomingEvents: (state) => state.splus.upcomingEvents,
      subscribedTimetable: (state) => state.splus.subscribedTimetable,
    }),
    ...mapGetters({
      subscribableTimetables: 'splus/subscribableTimetables',
      hasSubscribableTimetables: 'splus/hasSubscribableTimetables',
    }),
  },
  methods: {
    selectSubscribedTimetable(timetable) {
      this.setSubscribedTimetable(timetable);
      this.loadFutureEvents();
    },
    ...mapMutations({
      setSubscribedTimetable: 'splus/setSubscribedTimetable',
    }),
    ...mapActions({
      loadFutureEvents: 'splus/loadUpcomingLectures',
    }),
  },
};
</script>

<style lang="scss">
.event-description {
  padding-left: 0;
  & > li {
    list-style: none;
  }
}
</style>

