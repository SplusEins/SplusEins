import Vue from 'vue';
import colors from 'vuetify/es5/util/colors';
import * as moment from 'moment';
import SCHEDULES from '~/assets/schedules.json';
import * as chroma from 'chroma-js';

export const uniq = (iterable) => [...new Set(iterable)];
const flatten = (iterable) => [].concat(...iterable);
const scalarArraysEqual = (array1, array2) =>
  array1.length === array2.length &&
  array1.every((value, index) => value === array2[index]);

// update this in SS19
const isoWeek0 = moment()
  .year(2018)
  .startOf('year') // week 1
  .startOf('isoWeek') // start of week 1
  .subtract(1, 'weeks'); // start of week 0


export function customScheduleToRoute(customSchedule) {
  const params = {
    schedule: customSchedule.label,
  };
  const query = {
    id: customSchedule.id,
    course: customSchedule.whitelist,
    v: 1
  };

  return { name: 'schedule', params, query };
}

export function shortenScheduleDegree(schedule) {
  let shortenedDegree
  switch(schedule.degree){
    case "Bachelor of Science": shortenedDegree = "B.Sc."; break;
    case "Master of Science": shortenedDegree = "M.Sc."; break;
    case "Bachelor of Arts": shortenedDegree = "B.A."; break;
    case "Master of Arts": shortenedDegree = "M.A."; break;
    default: shortenedDegree = schedule.degree;
  }
  return shortenedDegree;
}

export const state = () => ({
  schedule: undefined,
  schedules: SCHEDULES.map(
    (schedule) => ({ ...schedule, path: `${schedule.faculty} ${schedule.degree}`, degreeShort: shortenScheduleDegree(schedule)})),
  /**
   * Map of created or visited custom schedules.
   * Key: label
   *
   * Values: custom schedule like this:
   * { ...schedule, label, whitelist: [ titleId ] }
   *
   * where
   * schedule: Base schedule.
   * label: Custom name.
   * filters: Whitelist array of keys.
   */
  customSchedules: {},
  /**
   * Map of { week: lectures[] }
   */
  favoriteSchedules: [],
  lectures: {},
  /**
   * Currently viewed week.
   * Week 53 of year 2018 equals week 1 of year 2019.
   */
  week: moment().diff(isoWeek0, 'week'),
  error: undefined,
  /**
   * If true, do not load lectures on the server.
   * true if frontend is a static build.
   */
  lazyLoad: false,
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

    const uniqueIds = uniq(flatten(Object.values(state.lectures))
      .map(({ lecturerId }) => lecturerId))
      .sort();

    const colorScale = chroma
      .scale([colors.lightBlue.darken4, colors.cyan.darken4])
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
  scheduleIds: (state) => {
    return state.schedules.map(({ id }) => id);
  },
  customSchedulesAsRoutes: (state, getters) => {
    return Object.values(state.customSchedules)
      .map(customScheduleToRoute);
  },
  customScheduleLabels: (state) => {
    return Object.keys(state.customSchedules);
  },
};

export const mutations = {
  /**
   * Add given lectures to the state,
   * paying respect to currently active whitelist.
   */
  setLectures(state, { lectures, week }) {
    const whitelist = state.schedule.whitelist;
    const filteredLectures = !!whitelist ? lectures.filter(
      (lecture1) => whitelist.includes(lecture1.titleId)) : lectures;

    // reactive variant of state.lectures[week].push(lectures)
    Vue.set(state.lectures, week, filteredLectures);
  },
  setWeek(state, week) {
    state.week = week;
  },
  setSchedule(state, schedule) {
    state.schedule = schedule;
  },
  addCustomSchedule(state, customSchedule) {
    const label = customSchedule.label;
    const customScheduleStored = state.customSchedules[label];

    // detect conflicts - never overwrite
    if (customScheduleStored != undefined) {
      const coursesGiven = customSchedule.whitelist;
      const coursesStored = customScheduleStored.whitelist;

      if (customSchedule.id != customScheduleStored.id ||
          !scalarArraysEqual(coursesGiven, coursesStored)) {
        console.log('not overwriting local custom schedule' +
          'with different configuration');
      }

      return;
    }

    Vue.set(state.customSchedules, label, customSchedule);
  },
  addFavoriteSchedule(state, favoriteSchedule){
    state.favoriteSchedules.push(favoriteSchedule);
  },
  removeFavoriteSchedule(state, favoriteSchedule){
    state.favoriteSchedules = state.favoriteSchedules.filter(schedule => schedule.id != favoriteSchedule.id);
  },
  setError(state, error) {
    state.error = error;
  },
  clearError(state) {
    state.error = undefined;
  },
  enableLazyLoad(state) {
    state.lazyLoad = true;
  },
};

export const actions = {
  /**
   * Request data from the given week from the API and write it to the store.
   */
  async loadWeek({ state, commit }, week) {
    if (!!state.lectures[week]) {
      return; // cached, noop
    }

    const ids = Array.isArray(state.schedule.id) ?
      state.schedule.id : [state.schedule.id];

    const response = await this.$axios.get(
      `/api/splus/${state.schedule.id}/${week}`);

    let lectures = [];
    await Promise.all(ids.map(async (id) => {
      try {
        const response = await this.$axios.get(`/api/splus/${id}/${week}`);
        lectures = lectures.concat(response.data);
      } catch (error) {
        commit('setError', 'API-Verbindung fehlgeschlagen');
        console.error('error during API call', error.message);
      }
    }));

    commit('setLectures', { week, lectures });
  },
  /**
   * Request data for the given week.
   */
  async load({ state, dispatch }, doPrefetch) {
    await dispatch('loadWeek', state.week);
  },
  /**
   * Request data for the given and the next week.
   */
  async loadPrefetching({ state, dispatch }) {
    await Promise.all([
      dispatch('load'),
      // prefetch the next week as well
      // +1 is safe because it's not actually week of year
      dispatch('loadWeek', state.week + 1)
    ]);
  },
  /**
   * Import schedule from route and set as current schedule.
   */
  importSchedule({ state, commit }, { params, query }) {
    switch (parseFloat(query.v)) {
      case 1:
        const courses = Array.isArray(query.course || []) ?
          query.course : [query.course];
        const ids = Array.isArray(query.id || []) ?
          query.id : [query.id];
        const customSchedule = {
          id: ids,
          label: params.schedule,
          whitelist: courses,
        };

        commit('addCustomSchedule', customSchedule);
        commit('setSchedule', customSchedule);
        break;
      default:
        if (!isNaN(query.v)) {
          console.log('unsupported custom schedule query version', query);
        }

        const schedule = state.schedules
          .find((schedule) => schedule.id == params.schedule);

        // standard, no filters
        commit('setSchedule', schedule);
    }
  },
};
