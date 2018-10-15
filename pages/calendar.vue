<template>
  <ds-calendar-app
    :calendar="calendar"
    :types="types"
    :read-only="true"
    @change="calendarChanged">

    <template slot="view">
      <v-menu>
        <v-btn
          slot="activator"
          flat>
          <span v-if="!this.$vuetify.breakpoint.xs">
            {{ currentCourse.label }}
          </span>
          <span v-else>
            {{ currentCourse.slug }}
          </span>
          <v-icon>arrow_drop_down</v-icon>
        </v-btn>
        <v-list>
          <v-list-tile
            v-for="course in courses"
            :key="course.id"
            @click="setCourse(course)">
            <v-list-tile-content>
              <v-list-tile-title>{{ course.label }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-menu>
    </template>
  </ds-calendar-app>
</template>

<script>
import * as moment from 'moment';
import { Calendar, Day, Units } from 'dayspan';
import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
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

      return this.getLecturesByWeekAndCourse(
        this.currentWeek,
        this.currentCourse.id
      ).map((lecture) => {
        const beginHours = Math.floor(lecture.begin);
	const start = moment()
          .week(lecture.week)
          .day(lecture.day + 1)
          .hour(beginHours)
          .minute((lecture.begin - beginHours) * 60);

        const hashOfFirstWordInTitle = hashCode(lecture.title.split(' ')[0]) + Math.pow(2, 31);
        const color = colorsArr[hashOfFirstWordInTitle % colorsArr.length].lighten1;
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
    ...mapState({
      currentWeek: state => state.calendar.week,
      currentCourse: state => state.courses.course,
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
    this.setWeek(moment().week());
    this.refresh();
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
      this.setWeek(calendar.start.weekOfYear);
    },
    refresh() {
      this.loadLectures({
        course: this.currentCourse.id,
        week: this.currentWeek
      });
    },
    ...mapMutations({
      setWeek: 'calendar/setWeek',
      setCourse: 'courses/setCourse',
    }),
    ...mapActions({
      loadLectures: 'splus/load',
    }),
  },
};
</script>

<style lang="scss">
</style>
