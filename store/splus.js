import Vue from 'vue';
import colors from 'vuetify/es5/util/colors';
import * as moment from 'moment';
import SCHEDULES from '~/assets/schedules.json';
import * as chroma from 'chroma-js';

// update this in SS19
const isoWeek0 = moment()
  .year(2018)
  .startOf('year') // week 1
  .startOf('isoWeek') // start of week 1
  .subtract(1, 'weeks'); // start of week 0

export const state = () => ({
  schedule: undefined,
  schedules: SCHEDULES.map(
    (schedule) => ({ ...schedule, path: `${schedule.faculty} ${schedule.degree}` })),
  /**
   * schedule: Base schedule.
   * label: Custom name.
   * filters: Whitelist array of composite keys.
   *
   * { ...schedule, label, filters: [ { title, lecturer } ] }
   */
  customSchedule: undefined,
  /**
   * Map of { week: lectures[] }
   */
  lectures: {},
  /**
   * Currently viewed week.
   * Week 53 of year 2018 equals week 1 of year 2019.
   */
  week: moment().diff(isoWeek0, 'week'),
  error: undefined,
});

export const getters = {
  getHasLecturesOnWeekend: (state) => {
    if (state.lectures[state.week] == undefined) {
      return false;
    }

    // 0: Monday, … 4: Friday, 5: Saturday, 6: Sunday
    return state.lectures[state.week].filter(lecture => lecture.day > 4).length > 0;
  },
  /**
   * @return The lectures as timestamp-aware dayspan calendar event inputs.
   * @see https://clickermonkey.github.io/dayspan/docs/interfaces/eventinput.html
   */
  getLecturesAsEvents: (state) => {
    if (state.lectures[state.week] == undefined) {
      return [];
    }

    const uniq = (iterable) => [...new Set(iterable)];
    const flatten = (iterable) => [].concat(...iterable);
    const uniqueIds = uniq(flatten(Object.values(state.lectures))
      .map(({ lecturerId }) => lecturerId))
      .sort();

    const colorScale = chroma
      .scale([colors.amber.darken1, colors.green.lighten1])
      .colors(uniqueIds.length);

    return state.lectures[state.week].map((lecture) => {
      const start = moment(lecture.start);
      const color = colorScale[uniqueIds.indexOf(lecture.lecturerId)];

      // standard ds-hour height: 40px, now 45px
      const multiplicator = 1.125;
      // 7 am is now 1 am
      const shiftingHours = 6;

      const adjustedMinutes = (lecture.begin - shiftingHours) * 60;
      const adjustedMinutesWithMultiplicator = adjustedMinutes * multiplicator;
      const hours = Math.floor(adjustedMinutesWithMultiplicator / 60);
      const minutes = adjustedMinutesWithMultiplicator - (hours * 60) -1;
      const durationWithMultiplicator = lecture.duration * multiplicator;

      const shiftedStart = start.clone()
        .hours(hours)
        .minutes(minutes);

      return {
        data: {
          title: lecture.title,
          color, // needs to be a hex string
          description: `${lecture.lecturer} ${lecture.room} ${lecture.info}`,
          location: lecture.room,
        },
        schedule: {
          on: shiftedStart,
          times: [ {
            hour: shiftedStart.hours(),
            minute: shiftedStart.minutes(),
          } ],
          duration: durationWithMultiplicator,
          durationUnit: 'hours',
        }
      };
    });
  },
  /**
   * Convert the state's star schema: { faculty, degree, semester, ...schedule }
   * into a hierarchy: { (faculty, degree): { semester: schedules } }
   */
  getSchedulesAsTree: (state) => {
    const tree = {};
    state.schedules.forEach((schedule) => {
      const path = schedule.path;
      if (tree[path] == undefined) {
        tree[path] = {};
      }

      const leaf1 = tree[path];
      if (leaf1[schedule.semester] == undefined) {
        leaf1[schedule.semester] = [];
      }

      const leaf2 = leaf1[schedule.semester];
      leaf2.push(schedule);
    });

    return tree;
  },
};

export const mutations = {
  addLectures(state, { lectures, week }) {
    // reactive variant of state.lectures[week] = lectures
    Vue.set(state.lectures, week, lectures);
  },
  setWeek(state, week) {
    state.week = week;
  },
  /**
   * Set the schedule and clear the cache.
   */
  setSchedule(state, schedule) {
    state.lectures = {};
    state.schedule = schedule;
  },
  /**
   * Set the base schedule and filters matching the given courses.
   */
  setCustomSchedule(state, { schedule, courses, name }) {
    state.customSchedule = {
      id: schedule.id,
      faculty: schedule.faculty,
      semester: schedule.semester,
      label: name,
      whitelist: courses.map(({ titleId }) => titleId),
    };
  },
  setError(state, error) {
    state.error = error;
  },
  clearError(state) {
    state.error = undefined;
  },
};

export const actions = {
  async load({ state, commit }) {
    try {
      const response = await this.$axios.get(`/api/splus/${state.schedule.id}/${state.week}`);
      let lectures = response.data;
      const whitelist = state.schedule.whitelist;
      if (!!whitelist) {
        lectures = lectures.filter(
          (lecture1) => whitelist.includes(lecture1.titleId));
      }
      commit('addLectures', { lectures, week: state.week });
    } catch (error) {
      commit('setError', 'API-Verbindung fehlgeschlagen');
      console.error('error during API call', error.message);
    }
  },
};
