import SCHEDULES from '~/assets/schedules.json';

export const state = () => ({
  lectures: [],
  schedules: SCHEDULES,
});

export const getters = {
  getLecturesByWeekAndSchedule: (state) => (week, schedule) => {
    return state.lectures.filter((lecture) =>
      lecture.week == week && lecture.schedule == schedule);
  },
};

export const mutations = {
  addLectures(state, lectures) {
    lectures
      .filter((lecture) => !state.lectures.find((lecture2) => lecture.id == lecture2.id))
      .forEach((lecture) => state.lectures.push(lecture));
  },
};

export const actions = {
  async load({ state, commit }, { schedule, week }) {
    const response = await this.$axios.get(`/api/splus/${schedule}/${week}`);
    commit('addLectures', response.data);
  },
};
