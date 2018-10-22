import COURSES from '~/assets/courses.json';

export const state = () => ({
  lectures: [],
  courses: COURSES,
});

export const getters = {
  getLecturesByWeekAndCourse: (state) => (week, course) => {
    return state.lectures.filter((lecture) =>
      lecture.week == week && lecture.course == course);
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
  async load({ state, commit }, { course, week }) {
    const response = await this.$axios.get(`/api/splus/${course}/${week}`);
    commit('addLectures', response.data);
  },
};
