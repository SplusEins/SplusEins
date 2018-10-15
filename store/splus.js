export const state = () => ({
  lectures: [],
  courses: [ {
    id: 'SPLUS63AE5A',
    label: 'B. Sc. - 2. Sem. Information Engineering (I-B-I2-IE)',
  }, {
    id: 'SPLUSB3BC29',
    label: 'B. Sc. - 3. Sem. Information Engineering (I-B-I3-IE)',
  } ],
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
