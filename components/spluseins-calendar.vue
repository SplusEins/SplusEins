<template lang="html">

  <dayspan-custom-calendar
    :calendar="calendar"
    :types="types"
    :read-only="true"
    @change="calendarChanged"/>

</template>

<script lang="js">
import * as moment from 'moment';
import { Calendar, Day, Units } from 'dayspan';
import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
import colors from 'vuetify/es5/util/colors';
import DayspanCustomCalendar from './dayspan-custom-calendar.vue'

const hashCode = (string) =>
string.split('').reduce((prevHash, currVal) =>
  (((prevHash << 5) - prevHash) + currVal.charCodeAt(0))|0, 0);


export default {
  name: 'SpluseinsCalendar',
  layout: 'empty',
  components: {
    DayspanCustomCalendar
  },
  data() {
    const around = Day.fromMoment(moment().startOf('isoWeek'));
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
      aboutDialogOpen: false,
      loading: false,
    };
  },
  computed: {
    events() {
      const colorsArr = Object.values(colors);
      return this.getLecturesByWeekAndCourse(
        this.currentWeek,
        this.currentCourse.id
      ).map((lecture) => {
        const beginHours = Math.floor(lecture.begin);
        const start = this.calendar.start.date.clone()
          .isoWeek(lecture.week)
          .day(lecture.day + 1)
          .hour(beginHours)
          .minute((lecture.begin - beginHours) * 60);
        const hashOfFirstWordInTitle = hashCode(lecture.title.split(' ')[0]) + Math.pow(2, 31);
        const color = colorsArr[hashOfFirstWordInTitle % colorsArr.length].lighten1;
        return {
          data: {
            title: lecture.title,
            color,
            description: `${lecture.lecturer} ${lecture.room} ${lecture.info}`,
            location: lecture.room,
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
    ...mapState({
      currentCourse: state => state.courses.course,
      currentWeek: state => state.calendar.week,
      courses: state => state.splus.courses,
    }),
    ...mapGetters({
      getLecturesByWeekAndCourse: 'splus/getLecturesByWeekAndCourse',
    }),
  },
  watch: {
    'events': 'applyEvents',
  },
  mounted() {
    this.setWeek(this.calendar.start.date.isoWeek());
  },
  methods: {
    applyEvents() {
      console.log('refreshing events');
      this.calendar.setEvents(this.events, true);
      this.calendar.refresh();
      this.refresh();
    },
    /** Update store's week after UI input */
    calendarChanged({ calendar }) {
      console.log('calendar changed');
      this.setWeek(calendar.start.date.isoWeek());
    },
    async refresh() {
      if (this.getLecturesByWeekAndCourse(
        this.currentWeek,
        this.currentCourse.id).length > 0) {
        return;
      }
      this.loading = true;
      await this.loadLectures({
        course: this.currentCourse.id,
        week: this.currentWeek
      });
      this.loading = false;
    },
    ...mapMutations({
      setWeek: 'calendar/setWeek',
    }),
    ...mapActions({
      loadLectures: 'splus/load',
    }),
  },
}
</script>

<style scoped lang="scss">
  .calendar-component {

  }
</style>
