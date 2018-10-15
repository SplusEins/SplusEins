<template>
  <ds-calendar-app
    :calendar="calendar"
    :types="types"
    :read-only="true"
    @change="calendarChanged">

    <template slot="title">
      SplusEins
    </template>

    <template slot="drawerPicker">
      <v-list>
        <v-list-group
          v-for="{ faculty, degree } in facultiesAndDegrees"
          :key="faculty + degree"
          value="true"
          no-action>
          <v-list-tile slot="activator">
            <v-list-tile-content>
              <v-list-tile-title>{{ faculty }} - {{ degree }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>

          <template 
            v-for="semester in getSemestersByFacultyAndDegree(faculty, degree)">
            <v-list-group
              v-if="getCoursesByFacultyAndDegreeAndSemester(faculty, degree, semester).length > 1"
              :key="semester"
              no-action
              sub-group>
              <v-list-tile slot="activator">
                <v-list-tile-content>
                  <v-list-tile-title>{{ semester }}. Semester</v-list-tile-title>
                </v-list-tile-content>
                <v-list-tile-action v-if="currentCourse.semester == semester">
                  <v-icon>check</v-icon>
                </v-list-tile-action>
              </v-list-tile>

              <v-list-tile
                v-for="course in getCoursesByFacultyAndDegreeAndSemester(faculty, degree, semester)"
                :key="course.id"
                @click="currentCourse = course">
                <v-list-tile-content value="true">
                  <v-list-tile-title value="true">{{ course.label }}</v-list-tile-title>
                </v-list-tile-content>
                <v-list-tile-action v-if="currentCourse == course">
                  <v-icon>check</v-icon>
                </v-list-tile-action>
              </v-list-tile>
            </v-list-group>

            <v-list-tile
              v-else
              :key="semester"
              @click="currentCourse = getCoursesByFacultyAndDegreeAndSemester(faculty, degree, semester)">
              <v-list-tile-content>
                <v-list-tile-title>{{ semester }}. Semester</v-list-tile-title>
              </v-list-tile-content>
              <v-list-tile-action v-if="currentCourse == getCoursesByFacultyAndDegreeAndSemester(faculty, degree, semester)">
                <v-icon>check</v-icon>
              </v-list-tile-action>
            </v-list-tile>
          </template>
        </v-list-group>
      </v-list>
    </template>

    <template slot="view">
      <div />
    </template>

    <template slot="containerInside">
      <v-progress-linear
        v-if="loading"
        :indeterminate="true"
        height="5"
        style="position: absolute; top: -1em; left: 3em;" />
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
    currentCourse: {
      get() {
        return this.$store.state.courses.course;
      },
      set(value) {
        this.$store.commit('courses/setCourse', value);
      }
    },
    ...mapState({
      currentWeek: state => state.calendar.week,
      courses: state => state.splus.courses,
    }),
    ...mapGetters({
      getLecturesByWeekAndCourse: 'splus/getLecturesByWeekAndCourse',
      facultiesAndDegrees: 'splus/facultiesAndDegrees',
      getSemestersByFacultyAndDegree: 'splus/getSemestersByFacultyAndDegree',
      getCoursesByFacultyAndDegreeAndSemester: 'splus/getCoursesByFacultyAndDegreeAndSemester',
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
    async refresh() {
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
};
</script>

<style lang="scss">
</style>
