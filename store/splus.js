import Vue from 'vue';
import colors from 'vuetify/es5/util/colors';
import * as moment from 'moment';
import TIMETABLES from '~/assets/timetables.json';
import * as chroma from 'chroma-js';

export const uniq = (iterable) => [...new Set(iterable)];
export const flatten = (iterable) => [].concat(...iterable);
const scalarArraysEqual = (array1, array2) =>
  array1.length === array2.length &&
  array1.every((value, index) => value === array2[index]);

// update this in SS19
const isoWeek0 = moment()
  .year(2018)
  .startOf('year') // week 1
  .startOf('isoWeek') // start of week 1
  .subtract(1, 'weeks'); // start of week 0


export function customTimetableToRoute(customTimetable) {
  const params = {
    timetable: customTimetable.label,
  };
  const query = {
    id: customTimetable.id,
    course: customTimetable.whitelist,
    v: 1
  };

  return { name: 'timetable', params, query };
}

export function shortenTimetableDegree(timetable) {
  let shortenedDegree
  switch(timetable.degree){
    case "Bachelor of Science": shortenedDegree = "B.Sc."; break;
    case "Master of Science": shortenedDegree = "M.Sc."; break;
    case "Bachelor of Arts": shortenedDegree = "B.A."; break;
    case "Master of Arts": shortenedDegree = "M.A."; break;
    default: shortenedDegree = timetable.degree;
  }
  return shortenedDegree;
}

export const state = () => ({
  timetable: undefined,
  timetables: TIMETABLES.map(
    (timetable) => ({ ...timetable, path: `${timetable.faculty} ${timetable.degree}`, degreeShort: shortenTimetableDegree(timetable)})),
  /**
   * Map of created or visited custom timetables.
   * Key: label
   *
   * Values: custom timetable like this:
   * { ...timetable, label, whitelist: [ titleId ] }
   *
   * where
   * timetable: Base timetable.
   * label: Custom name.
   * filters: Whitelist array of keys.
   */
  customTimetables: {},
  /**
   * Map of { week: lectures[] }
   */
  favoriteTimetables: [],
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
        timetable: {
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
   * Convert the state's star schema: { faculty, degree, semester, ...timetable }
   * into a hierarchy: { (faculty, degree): { semester: timetables } }
   */
  getTimetablesAsTree: (state) => {
    const tree = {};
    state.timetables.forEach((timetable) => {
      const path = timetable.path;
      if (tree[path] == undefined) {
        tree[path] = {};
      }

      const leaf1 = tree[path];
      if (leaf1[timetable.semester] == undefined) {
        leaf1[timetable.semester] = [];
      }

      const leaf2 = leaf1[timetable.semester];
      leaf2.push(timetable);
    });

    return tree;
  },
  timetableIds: (state) => {
    return state.timetables.map(({ id }) => id);
  },
  getTimetableById: (state) => (timetableId) => {
    return state.timetables.find(({ id }) => id == timetableId);
  },
  customTimetablesAsRoutes: (state, getters) => {
    return Object.values(state.customTimetables)
      .map(customTimetableToRoute);
  },
  customTimetableLabels: (state) => {
    return Object.keys(state.customTimetables);
  },
  isCustomTimetable: (state) => {
    return !!state.timetable.whitelist;
  },
};

export const mutations = {
  /**
   * Add given lectures to the state,
   * paying respect to currently active whitelist.
   */
  setLectures(state, { lectures, week }) {
    const whitelist = state.timetable.whitelist;
    const filteredLectures = !!whitelist ? lectures.filter(
      (lecture1) => whitelist.includes(lecture1.titleId)) : lectures;

    // reactive variant of state.lectures[week].push(lectures)
    Vue.set(state.lectures, week, filteredLectures);
  },
  setWeek(state, week) {
    state.week = week;
  },
  setTimetable(state, timetable) {
    state.timetable = timetable;
  },
  addCustomTimetable(state, customTimetable) {
    const label = customTimetable.label;
    const customTimetableStored = state.customTimetables[label];

    // detect conflicts - never overwrite
    if (customTimetableStored != undefined) {
      const coursesGiven = customTimetable.whitelist;
      const coursesStored = customTimetableStored.whitelist;

      if (customTimetable.id != customTimetableStored.id ||
          !scalarArraysEqual(coursesGiven, coursesStored)) {
        console.log('not overwriting local custom timetable' +
          'with different configuration');
      }

      return;
    }

    Vue.set(state.customTimetables, label, customTimetable);
  },
  deleteCustomTimetable(state, customTimetable) {
    Vue.delete(state.customTimetables, customTimetable.label);
  },
  addFavoriteTimetable(state, favoriteTimetable){
    if(state.favoriteSchedules.filter(favorite => favorite.id == favoriteTimetable.id).length == 0){
      state.favoriteSchedules.push(favoriteTimetable);
    }
  },
  removeFavoriteTimetable(state, favoriteTimetable){
    state.favoriteTimetables = state.favoriteTimetables.filter(timetable => timetable.id != favoriteTimetable.id);
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

    const ids = Array.isArray(state.timetable.id) ?
      state.timetable.id : [state.timetable.id];

    const response = await this.$axios.get(
      `/api/splus/${state.timetable.id}/${week}`);

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
   * Import timetable from route and set as current timetable.
   */
  importTimetable({ state, commit }, { params, query }) {
    switch (parseFloat(query.v)) {
      case 1:
        const courses = Array.isArray(query.course || []) ?
          query.course : [query.course];
        const ids = Array.isArray(query.id || []) ?
          query.id : [query.id];
        const customTimetable = {
          id: ids,
          label: params.timetable,
          whitelist: courses,
        };

        commit('addCustomTimetable', customTimetable);
        commit('setTimetable', customTimetable);
        break;
      default:
        if (!isNaN(query.v)) {
          console.log('unsupported custom timetable query version', query);
        }

        const timetable = state.timetables
          .find((timetable) => timetable.id == params.timetable);

        // standard, no filters
        commit('setTimetable', timetable);
    }
  },
};
