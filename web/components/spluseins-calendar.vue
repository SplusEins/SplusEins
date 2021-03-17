<template>
  <v-calendar
    :calendar="calendar"
    :now="today"
    :value="today"
    type="week"
  >
    <template slot="actions">
      <calendar-action-bar />
    </template>

    <template slot="containerInside">
      <span class="overlay">
        Quelle: stundenplan.ostfalia.de
      </span>
    </template>

    <template
      slot="eventPopover"
      slot-scope="slotData"
    >
      <dayspan-custom-event-popover v-bind="slotData" />
    </template>
  </v-calendar>
</template>

<script>
import * as moment from 'moment';
import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
import CalendarActionBar from './calendar-action-bar.vue';
import DayspanCustomEventPopover from './dayspan-custom-event-popover.vue';

export default {
  name: 'SpluseinsCalendar',
  components: {
    CalendarActionBar,
    DayspanCustomEventPopover
  },
  data () {
    const week = moment()
      .isoWeek(this.$store.getters['splus/weekOrDefault'])
      .startOf('isoWeek');

    // computed properties are not available during client rendering yet, access the getter directly
    calendar.setEvents(this.$store.getters['splus/getCalendarEvents']);

    return {
      calendar
    };
  },
  computed: {
    ...mapState({
      currentWeek: (state) => state.splus.week,
      lazyLoad: (state) => state.lazyLoad,
      schedule: (state) => state.splus.schedule
    }),
    ...mapGetters({
      events: 'splus/getCalendarEvents'
    })
  },
  mounted () {
    if (this.lazyLoad) {
      // static build -> no events are in the store
      this.refresh();
    }
  },
  methods: {
    async next () {
      // Jump forward 7 days, but do not refresh now (will be called in this.refresh())
      this.calendar.next(7, true);
      await this.refresh();
    },
    async prev () {
      // Jump back 7 days
      this.calendar.prev(7, true);
      await this.refresh();
    },
    async today () {
      this.resetWeek(true);
      // This scrolls forward or backward until the today's week has been reached
      while (this.calendar.start.date.isoWeek() > this.currentWeek) {
        this.calendar.prev(7, true);
      }
      while (this.calendar.start.date.isoWeek() < this.currentWeek) {
        this.calendar.next(7, true);
      }
      await this.refresh();
    },
    async refresh () {
      // Store the week so switching calendars keeps the same week
      this.setWeek(this.calendar.start.date.isoWeek());
      // Load the data and store the events in the calendar
      await this.load();
      this.calendar.setEvents(this.events);
      // Refresh calendar AFTER the events have been loaded to avoid flickering
      this.calendar.refresh();
    },
    ...mapMutations({
      setWeek: 'splus/setWeek',
      resetWeek: 'splus/resetWeek'
    }),
    ...mapActions({
      load: 'splus/load'
    })
  }
};
</script>

<style scoped lang="scss">
.overlay {
  line-height: 100%;
  padding-top: 3px;
  display: flex;
  justify-content: flex-end;
  opacity: 0.5;
  font-size: 12px;
}
</style>
