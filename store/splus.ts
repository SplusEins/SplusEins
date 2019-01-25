import colors from 'vuetify/es5/util/colors';
import * as moment from 'moment';
import * as TIMETABLES from '~/assets/timetables.json';
import * as chroma from 'chroma-js';
import TimetableConfiguration from '~/model/TimetableConfiguration';
import { Route } from 'vue-router';

export const uniq = (iterable) => [...new Set(iterable)];
export const flatten = (iterable) => [].concat(...iterable);
const scalarArraysEqual = (array1, array2) =>
  array1.length === array2.length &&
  array1.every((value, index) => value === array2[index]);


export function customScheduleToRoute(customTimetable): Partial<Route> {
  const query = {
    id: customTimetable.id,
    course: customTimetable.whitelist,
    name: customTimetable.label,
    v: '1',
  };

  return { name: 'plan-timetable', params: {}, query };
}

export function scheduleToRoute(timetable): Partial<Route> {
  return {
    name: 'plan-timetable',
    params: { timetable: timetable.id },
  };
}

export function shortenTimetableDegree(timetable): string {
  let shortenedDegree;

  switch(timetable.degree){
    case 'Bachelor of Science': shortenedDegree = 'B.Sc.'; break;
    case 'Master of Science': shortenedDegree = 'M.Sc.'; break;
    case 'Bachelor of Arts': shortenedDegree = 'B.A.'; break;
    case 'Master of Arts': shortenedDegree = 'M.A.'; break;
    case 'Bachelor of Engineering': shortenedDegree = 'B.Eng.'; break;
    case 'Master of Engineering': shortenedDegree = 'M.Eng.'; break;
    case 'Bachelor of Laws': shortenedDegree = 'LL.B.'; break;
    case 'Master of Laws': shortenedDegree = 'LL.M.'; break;
    default: shortenedDegree = timetable.degree;
  }

  return shortenedDegree;
}

function defaultWeek() {
  if (moment().isoWeek() < 10) {
    // default to start of SS19
    return 10;
  }

  // if the user is looking at today and is on Sat/Sun, peek to the next week
  if (moment().day() == 6 || moment().day() == 0) {
    return moment().isoWeek() + 1;
  } else {
    return moment().isoWeek();
  }
}

export const state = () => ({
  schedule: undefined,
  schedules: TIMETABLES.map(
    (timetable) => ({
      ...timetable,
      path: `${timetable.faculty} ${timetable.degree}`,
      route: {
        name: 'plan-timetable',
        params: { timetable: timetable.id },
      },
      description: `${shortenTimetableDegree(timetable)} ${timetable.label} - ${timetable.semester}. Sem.`,
    })),
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
  customSchedules: {},
  /**
   * Map of { week: lectures[] }
   */
  favoriteSchedules: [],
  subscribedTimetable: {},
  lectures: {},
  /**
   * Currently viewed week.
   * Week 53 of year 2018 equals week 1 of year 2019.
   */
  week: undefined,
});

export const getters = {
  weekOrDefault: (state) => {
    return state.week || defaultWeek();
  },
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

    const lecturesByStart = new Map();
    const lectureStartKey = (lecture) => `${lecture.day} ${lecture.begin}`;
    state.lectures[state.week].forEach((lecture) =>
      lecturesByStart.set(lectureStartKey(lecture), [...
        (lecturesByStart.get(lectureStartKey(lecture)) || []),
        lecture]));

    return state.lectures[state.week].map((lecture) => {
      const start = moment(lecture.start)
        .add(lecture.begin, 'hours');
      const color = colorScale[uniqueIds.indexOf(lecture.lecturerId)];

      return {
        data: {
          title: lecture.title,
          color, // needs to be a hex string
          description: lecture.lecturer ? `${lecture.lecturer}\n${lecture.info}`: `${lecture.info}`,
          location: lecture.room,
          concurrentCount: lecturesByStart.get(lectureStartKey(lecture))
            .length,
          concurrentOffset: lecturesByStart.get(lectureStartKey(lecture))
            .indexOf(lecture),
        },
        schedule: {
          on: start,
          times: [ {
            hour: start.hours(),
            minute: start.minutes(),
          } ],
          duration: lecture.duration,
          durationUnit: 'hours',
        }
      };
    });
  },
  /**
   * Convert the state's star schema: { faculty, degree, semester, ...timetable }
   * into a hierarchy: { (faculty, degree): { semester: timetables } }
   */
  getSchedulesAsTree: (state) => {
    const tree = {};
    state.schedules.forEach((timetable) => {
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
  scheduleIds: (state) => {
    return state.schedules.map(({ id }) => id);
  },
  getScheduleById: (state) => (timetableId) => {
    return state.schedules.find(({ id }) => id == timetableId);
  },
  customSchedulesAsRoutes: (state, getters) => {
    return Object.values(state.customSchedules)
      .map(customScheduleToRoute);
  },
  customScheduleLabels: (state) => {
    return Object.keys(state.customSchedules);
  },
  isCustomSchedule: (state) => {
    return !!state.schedule && !!state.schedule.whitelist;
  },
  subscribableTimetables: (state) => {
    return [...Object.values(state.customSchedules), ...state.favoriteSchedules];
  }
};

export const mutations = {
  /**
   * Add given lectures to the state,
   * paying respect to currently active whitelist.
   * Deduplicate using the title ID.
   */
  setLectures(state, { lectures, week }) {
    // filter based on whitelist
    const whitelist = state.schedule.whitelist;
    const filteredLectures = !!whitelist ? lectures.filter(
      (lecture1) => whitelist.includes(lecture1.titleId)) : lectures;

    // filter duplicates
    const key = (lecture) =>
      `${lecture.lecturerId} ${lecture.titleId} ${lecture.room} ` +
      `${lecture.day} ${lecture.begin} ${lecture.duration}`;
    const lecturesByKey = new Map();
    filteredLectures.forEach(
      (lecture) => lecturesByKey.set(key(lecture), lecture));
    const uniqueLectures = [...lecturesByKey.values()];

    // reactive variant of state.lectures[week].push(lectures)
    this._vm.$set(state.lectures, week, uniqueLectures);
  },
  clearLectures(state) {
    state.lectures = {};
  },
  setWeek(state, week) {
    state.week = week;
  },
  resetWeek(state, forceDefault) {
    if (forceDefault) {
      state.week = defaultWeek();
    } else {
      state.week = state.week || defaultWeek();
    }
  },
  setSchedule(state, timetable) {
    state.schedule = timetable;
  },
  addCustomSchedule(state, customTimetable) {
    const label = customTimetable.label;
    const customTimetableStored = state.customSchedules[label];

    // detect conflicts - never overwrite
    if (customTimetableStored != undefined) {
      const coursesGiven = customTimetable.whitelist;
      const coursesStored = customTimetableStored.whitelist;

      if (customTimetable.id != customTimetableStored.id ||
          !scalarArraysEqual(coursesGiven, coursesStored)) {
        console.log('not overwriting local custom timetable ' +
          'with different configuration');
      }

      return;
    }

    this._vm.$set(state.customSchedules, label, customTimetable);
    if(Object.keys(state.subscribedTimetable).length === 0) {
      state.subscribedTimetable = state.customSchedules[label];
    }
  },
  deleteCustomSchedule(state, customTimetable) {
    this._vm.$delete(state.customSchedules, customTimetable.label);
    if(state.subscribedTimetable.label == customTimetable.label) {
      const subscribables = [...Object.values(state.customSchedules), ...state.favoriteSchedules];
      state.subscribedTimetable = subscribables.length == 0? {} : subscribables[0];
    }
  },
  addFavoriteSchedule(state, favoriteTimetable){
    if(state.favoriteSchedules.filter(favorite => favorite.id == favoriteTimetable.id).length == 0){
      state.favoriteSchedules.push(favoriteTimetable);
      if(Object.keys(state.subscribedTimetable).length === 0) {
        state.subscribedTimetable = favoriteTimetable;
      }
    }
  },
  removeFavoriteSchedule(state, favoriteTimetable){
    state.favoriteSchedules = state.favoriteSchedules
      .filter((timetable) => timetable.id != favoriteTimetable.id);
    if(state.subscribedTimetable.id == favoriteTimetable.id) {
      const subscribables = [...Object.values(state.customSchedules), ...state.favoriteSchedules];
      state.subscribedTimetable = subscribables.length == 0? {} : subscribables[0];
    }
  },
  setSubscribedTimetable(state, timetable) {
    state.subscribedTimetable = timetable;
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

    let lectures = [];
    await Promise.all(ids.map(async (id) => {
      try {
        const response = await this.$axios.get(`/api/splus/${id}/${week}`);
        lectures = lectures.concat(response.data);
      } catch (error) {
        commit('enqueueError', 'Stundenplan: API-Verbindung fehlgeschlagen', {root:true});
        console.error('error during API call', error.message);
      }
    }));

    commit('setLectures', { week, lectures });
  },
  /**
   * Request data for the given week.
   */
  async load({ state, dispatch }) {
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
  importSchedule({ state, commit }, { params, query }) {
    commit('clearLectures');

    switch (parseFloat(query.v)) {
      case 1:
        const whitelist: string[] = Array.isArray(query.course || []) ?
          query.course : [query.course];
        const id: string[] = Array.isArray(query.id || []) ?
          query.id : [query.id];
        const label: string = query.name;
        const customTimetable = { id, label, whitelist } as TimetableConfiguration;

        commit('addCustomSchedule', customTimetable);
        commit('setSchedule', customTimetable);
        break;
      default:
        if (!isNaN(query.v)) {
          console.log('unsupported custom timetable query version', query);
        }

        const timetable = state.schedules
          .find((timetable) => timetable.id == params.timetable);

        // standard, no filters
        commit('setSchedule', timetable);
    }
  },
};
