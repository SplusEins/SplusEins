<template>
  <dayspan-custom-calendar
    :calendar="calendar"
    :types="types"
    :read-only="true"
    @change="calendarChanged"
  >
    <template slot="actions">
      <calendar-action-bar />
    </template>

    <template slot="containerInside">
      <span class="overlay">
        Quelle: splus.ostfalia.de
      </span>
    </template>

    <template
      slot="eventPopover"
      slot-scope="slotData"
    >
      <dayspan-custom-event-popover v-bind="slotData" />
    </template>
  </dayspan-custom-calendar>
</template>

<script>
import * as moment from 'moment';
import { Calendar, Day, Units } from 'dayspan';
import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
import CalendarActionBar from './calendar-action-bar.vue';
import DayspanCustomCalendar from './dayspan-custom-calendar.vue';
import DayspanCustomEventPopover from './dayspan-custom-event-popover.vue';

export default {
  name: 'SpluseinsCalendar',
  components: {
    CalendarActionBar,
    DayspanCustomCalendar,
    DayspanCustomEventPopover,
  },
  data() {
    const week = moment()
      .isoWeek(this.$store.getters['splus/weekOrDefault'])
      .startOf('isoWeek');
    const around = Day.fromMoment(week);
    const weeklyCalendar = {
      id: 'W',
      label: 'Woche',
      shortcut: 'W',
      type: Units.DAY,
      size: 7,
      around,
      focus: 0,
      repeat: true,
      listTimes: true,
      updateRows: true,
      schedule: false
    };
    const calendar = Calendar.days(7, around, 0);

    // computed properties are not available during client rendering yet, access the getter directly
    calendar.setEvents(this.$store.getters['splus/getLecturesAsEvents']);

    return {
      calendar,
      types: [ weeklyCalendar ],
    };
  },
  computed: {
    ...mapState({
      currentWeek: (state) => state.splus.week,
      lazyLoad: (state) => state.lazyLoad,
    }),
    ...mapGetters({
      events: 'splus/getLecturesAsEvents',
    }),
  },
  watch: {
    'events': function(events) {
      this.calendar.setEvents(events);
    },
    'currentWeek': 'loadLectures',
  },
  mounted() {
    if (this.lazyLoad) {
      // static build -> no lectures are in the store
      this.loadLectures();
    }
  },
  methods: {
    calendarChanged({ calendar }) {
      this.setWeek(calendar.start.date.isoWeek());
    },
    ...mapMutations({
      setWeek: 'splus/setWeek',
    }),
    ...mapActions({
      loadLectures: 'splus/loadPrefetching',
    }),
  },
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
