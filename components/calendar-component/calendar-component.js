import * as moment from 'moment';
import { Calendar, Day, Units } from 'dayspan';
import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
import colors from 'vuetify/es5/util/colors';

const hashCode = (string) =>
string.split('').reduce((prevHash, currVal) =>
  (((prevHash << 5) - prevHash) + currVal.charCodeAt(0))|0, 0);


export default {
  name: 'calendar-component',
  layout: 'empty',
  components: {},
  props: [],
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
            description: `${lecture.lecturer} ${lecture.room} ${lecture.info}`,
            location: lecture.room,
          },
          schedule: {
            on: start,
	          times: [ {hour: start.hour(),minute: start.minute(),} ],
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
      if (this.getLecturesByWeekAndCourse(
        this.currentWeek,
        this.currentCourse.id).length > 0) {
        return;
      }
      this.loading = false;
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
  }
}
