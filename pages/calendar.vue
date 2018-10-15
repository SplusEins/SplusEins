<template>
  <ds-calendar-app
    :calendar="calendar"
    :types="types"
    :read-only="true"
    @change="calendarChange">

    <template slot="view">
      <div />
    </template>
  </ds-calendar-app>
</template>

<script>
import * as moment from 'moment';
import { Calendar, Day, Units } from 'dayspan';
import { mapMutations } from 'vuex';
import colors from 'vuetify/es5/util/colors';

const hashCode = (string) =>
  string.split('').reduce((prevHash, currVal) =>
    (((prevHash << 5) - prevHash) + currVal.charCodeAt(0))|0, 0);

export default {
  name: 'HomePage',
  layout: 'empty',
  data() {
    // prev/next lazy loading is hardwired for 7d week starting on Monday!
    const around = Day.fromMoment(moment().startOf('week'));
    const calendarWeekType = {
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

    return {
      calendar,
      types: [ calendarWeekType ],
    };
  },
  computed: {
    events() {
      const colorsArr = Object.values(colors);

      return this.$store.getters['splus/getLecturesByWeek'](this.$store.state.calendar.week).map((lecture) => {
        const beginHours = Math.floor(lecture.begin);
	const start = moment()
          .week(lecture.week)
          .day(lecture.day + 1)
          .hour(beginHours)
          .minute((lecture.begin - beginHours) * 60);

        const hashOfFirstWordInTitle = hashCode(lecture.title.split(' ')[0])+Math.pow(2, 31);
        const color = colorsArr[hashOfFirstWordInTitle%colorsArr.length].lighten1;
	return {
          data: {
            title: lecture.title,
            color,
          },
          schedule: {
            on: start,
	    times: [ {
	      hour: start.hour(),
	      minute: start.minute(),
	    } ],
            duration: lecture.end - lecture.begin,
            durationUnit: 'hours',
          }
	};
      });
    },
  },
  watch: {
    'events': 'applyEvents',
  },
  mounted() {
    this.calendarChange({ calendar: this.calendar });
  },
  methods: {
    applyEvents() {
      console.log('refreshed events');
      this.calendar.setEvents(this.events);
      this.calendar.refresh();
    },
    calendarChange({ calendar }) {
      console.log('calendar changed');
      const week = calendar.start.weekOfYear;
      this.$store.commit('calendar/setWeek', week);
      this.$store.dispatch('splus/load', {
        course: '63AE5A',
        week: week
      });
    },
  },
};
</script>

<style lang="scss">
</style>
