<template>
  <v-card class="fill-height">
    <v-card-title>
      <span class="text-h5">Nächste Vorlesung</span>
      <v-btn
        v-show="hasSubscribableTimetables"
        icon
        @click="dialogOpen = true"
      >
        <v-icon>{{ mdiBookmarkOutline }}</v-icon>
      </v-btn>
    </v-card-title>

    <v-card-text
      v-if="nextEvent !== undefined"
      class="text--primary"
    >
      <b>{{ nextEvent.title }} {{ nextEvent.lecturer }}</b>
      <br>
      <span class="text--secondary">Datum:</span> {{ nextEvent.start.format('dddd, DD.MM.YYYY') }}
      <br>
      <span class="text--secondary">Uhrzeit:</span> {{ nextEvent.start.hour() }}:{{ nextEvent.start.minute() === 0? "00" : nextEvent.start.minute() }} Uhr
      <br>
      <span v-if="!!nextEvent.room">
        <span class="text--secondary">Raum:</span> <span v-html="nextEvent.room" />
      </span>
    </v-card-text>
    <v-card-text v-else-if="hasSubscribableTimetables && nextEvent === undefined">
      <i>Keine weiteren Vorlesungen in dieser Woche!</i>
    </v-card-text>
    <v-card-text v-else>
      <i>Markiere bitte Favoriten oder erstelle personalisierte Pläne, um diese Option nutzen zu können!</i>
    </v-card-text>

    <lazy-select-dialog
      :open.sync="dialogOpen"
      :items="subscribableTimetables"
      :selected.sync="selectedItem"
      title="Plan abonnieren"
    />
  </v-card>
</template>

<script>
import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
import { mdiBookmarkOutline } from '@mdi/js'

export default {
  name: 'UpcomingLecturesCard',
  data () {
    return {
      now: Date.now(),
      refreshTimer: undefined,
      dialogOpen: false,
      mdiBookmarkOutline
    }
  },
  computed: {
    selectedItem: {
      get () { return this.subscribedTimetable; },
      set (value) { this.setSubscribedTimetable(value); }
    },
    ...mapState({
      upcomingEvents: (state) => state.splus.upcomingEvents,
      upcomingLecturesTimetable: (state) => state.splus.upcomingLecturesTimetable,
      subscribedTimetable: (state) => state.splus.subscribedTimetable,
      browserStateReady: (state) => state.browserStateReady
    }),
    ...mapGetters({
      subscribableTimetables: 'splus/subscribableTimetables',
      hasSubscribableTimetables: 'splus/hasSubscribableTimetables'
    }),
    nextEvent () {
      const possibleEvents = this.upcomingEvents
        .map(event => ({
          title: event.title,
          room: event.location,
          lecturer: event.meta.organiserName,
          start: this.$dayjs(event.start)
        }))
      // Find the next event or use the current event if it's only x minutes ago
        .filter(event => event.start.valueOf() - this.now > -15 * 60 * 1000)
        .sort((a, b) => a.start.valueOf() - b.start.valueOf());
      return possibleEvents[0] !== undefined ? possibleEvents[0] : undefined;
    }
  },
  watch: {
    subscribedTimetable () {
      if (this.browserStateReady && !!this.subscribedTimetable.id) {
        this.load();
      }
    }
  },
  mounted () {
    if (this.subscribedTimetable.id) {
      this.load();
    }
    // Refresh current date so the nextEvent is reevaluated every now and then without a manual refresh from the user
    this.refreshTimer = setInterval(() => (this.now = Date.now()), 60 * 1000)
  },
  destroyed () {
    clearInterval(this.refreshTimer)
  },
  methods: {
    ...mapMutations({
      setSubscribedTimetable: 'splus/setSubscribedTimetable',
      setUpcomingLecturesTimetable: 'splus/setUpcomingLecturesTimetable'
    }),
    ...mapActions({
      loadEvents: 'splus/loadUpcomingEvents'
    }),
    load () {
      this.setUpcomingLecturesTimetable(this.subscribedTimetable);
      this.loadEvents();
    }
  }
};
</script>

<style lang="scss">

</style>
