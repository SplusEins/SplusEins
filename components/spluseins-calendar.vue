<template lang="html">
  <dayspan-custom-calendar
    :calendar="calendar"
    :types="types"
    :read-only="true"
    @change="calendarChanged">
    <template slot="containerInside">
      <span class="overlay">
        Quelle: splus.ostfalia.de
      </span>
    </template>
  </dayspan-custom-calendar>
</template>

<script lang="js">
import * as moment from 'moment';
import { Calendar, Day, Units } from 'dayspan';
import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
import DayspanCustomCalendar from './dayspan-custom-calendar.vue'

export default {
  name: 'SpluseinsCalendar',
  layout: 'empty',
  components: {
    DayspanCustomCalendar
  },
  data() {
    const startOfWeek = Day.fromMoment(moment().startOf('isoWeek'));
    const weeklyCalendar = {
      id: 'W',
      label: 'Woche',
      shortcut: 'W',
      type: Units.DAY,
      size: 7,
      around: startOfWeek,
      focus: 0,
      repeat: true,
      listTimes: true,
      updateRows: true,
      schedule: false
    };
   const calendar = Calendar.days(7, startOfWeek, 0);

    // computed properties are not available during client rendering yet, access the getter directly
    calendar.setEvents(this.$store.getters['splus/getLecturesAsEvents']);

    return {
      calendar,
      types: [ weeklyCalendar ]
    };
  },
  computed: {
    ...mapState({
      currentSchedule: state => state.splus.schedule,
      currentWeek: state => state.splus.week,
    }),
    ...mapGetters({
      events: 'splus/getLecturesAsEvents',
    }),
  },
  watch: {
    'events': function(events) {
      this.calendar.setEvents(events);
    },
    'currentSchedule': 'loadLectures',
    'currentWeek': 'loadLectures',
  },
  mounted() {
    if (this.events.length == 0) {
      // static build -> store has not been filled yet
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
      loadLectures: 'splus/load',
    }),
  },
}
</script>

<style scoped lang="scss">

.overlay {
  position: absolute;
  opacity: 0.5;
  font-size: 12px;
}

@media screen and (max-width: 1000px) {
  .overlay {
    right: 20px;
    bottom: 15px;
  }
}

@media screen and (min-width: 1000px) {
  .overlay {
    right: 45px;
    bottom: 22px;
  }
}
</style>
