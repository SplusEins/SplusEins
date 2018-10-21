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
      <nested-course-list />
    </template>

    <template slot="view">
      <v-dialog
        v-model="aboutDialogOpen"
        width="500">
        <v-btn
          slot="activator"
          depressed>
          Über
        </v-btn>

        <v-card>
          <v-card-title
            class="headline grey lighten-2"
            primary-title>
            Über
          </v-card-title>

          <v-card-text>
            <about-text />
          </v-card-text>

          <v-divider />

          <v-card-actions>
            <v-spacer />
            <v-btn
              color="primary"
              flat
              @click="aboutDialogOpen = false">
              Okay
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
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
import AboutText from '~/components/AboutText.vue';
import NestedCourseList from '~/components/NestedCourseList.vue';

const hashCode = (string) =>
  string.split('').reduce((prevHash, currVal) =>
    (((prevHash << 5) - prevHash) + currVal.charCodeAt(0))|0, 0);

export default {
  name: 'HomePage',
  layout: 'empty',
  components: {
    AboutText,
    NestedCourseList,
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
    const calendar = Calendar.weeks();

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
        const start = moment()
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
    this.setWeek(moment().isoWeek());
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
};
</script>

<style lang="scss">
</style>
