import Vue from 'vue';
import colors from 'vuetify/es5/util/colors';
import * as moment from 'moment';
import SCHEDULES from '~/assets/schedules.json';

const hashCode = (string) =>
string.split('').reduce((prevHash, currVal) =>
  (((prevHash << 5) - prevHash) + currVal.charCodeAt(0))|0, 0);


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

    const colorsArr = Object.values(colors).slice(0, -1); // exclude black

    return state.lectures[state.week].map((lecture) => {
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
    const response = await this.$axios.get(`/api/splus/${state.schedule.id}/${state.week}`);
    commit('addLectures', { lectures: response.data, week: state.week });
  },
};
