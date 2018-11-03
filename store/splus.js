import Vue from 'vue';
import colors from 'vuetify/es5/util/colors';
import * as moment from 'moment';
import SCHEDULES from '~/assets/schedules.json';
import * as chroma from 'chroma-js';

export const state = () => ({
  schedule: SCHEDULES[0],
  schedules: SCHEDULES,
  /**
   * Map of { week: lectures[] }
   */
  lectures: {},
  /**
   * Currently viewed iso week of year.
   * Week 53 of year 2018 equals week 1 of year 2019.
   */
  week: moment().isoWeek(), // TODO won't work in 2019
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

    const lectureToId = (lecture) => lecture.title.split(' ')[0];
    const uniq = (iterable) => [...new Set(iterable)];
    const flatten = (iterable) => [].concat(...iterable);
    const uniqueIds = uniq(flatten(Object.values(state.lectures)).map(lectureToId));

    const colorScale = chroma.scale([colors.amber.darken1, colors.green.lighten1]).colors(uniqueIds.length);

    return state.lectures[state.week].map((lecture) => {
      const color = colorScale[uniqueIds.indexOf(lectureToId(lecture))];

      // standard ds-hour height: 40px, now 45px 
      const multiplicator = 1.125;
      // 7 am is now 1 am
      const shiftingHours = 6;

      const adjustedMinutes = (lecture.begin - shiftingHours) * 60;
      const adjustedMinutesWithMultiplicator = adjustedMinutes * multiplicator;
      const hours = Math.floor(adjustedMinutesWithMultiplicator / 60);
      const minutes = adjustedMinutesWithMultiplicator - (hours * 60) -1;
      const durationWithMultiplicator = (lecture.end - lecture.begin) * multiplicator

      const start = moment()
        .isoWeek(lecture.week)
        .isoWeekday(lecture.day + 1)
        .hour(hours)
        .minute(minutes);

      return {
        data: {
          title: lecture.title,
          color, // needs to be a hex string
          description: `${lecture.lecturer} ${lecture.room} ${lecture.info}`,
          location: lecture.room,
        },
        schedule: {
          on: start,
          times: [ {
            hour: start.hour(),
            minute: start.minute(),
          } ],
          duration: durationWithMultiplicator,
          durationUnit: 'hours',
        }
      };
    });
  },
  getCourses: (state) => {
    const lectureToId = (lecture) => lecture.title.split(' ')[0];
    const allLectures = [].concat(...Object.values(state.lectures));
    const uniqueLectures = new Map();
    allLectures.forEach((lecture) => uniqueLectures.set(lectureToId(lecture), lecture));
    return [...uniqueLectures.values()];
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
};

export const actions = {
  async load({ state, commit }) {
    try {
      const response = await this.$axios.get(`/api/splus/${state.schedule.id}/${state.week}`);
      commit('addLectures', { lectures: response.data, week: state.week });
    } catch (error) {
      console.error('error during API call', error); // TODO add notification in UI
    }
  },
};
