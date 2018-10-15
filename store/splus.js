export const state = () => ({
  lectures: [],
  courses: [ {
    id: 'SPLUS63AE59',
    slug: 'I-B-I1',
    label: 'B.Sc. - 1. Sem. Informatik',
  }, {
    id: 'SPLUSB3BC21',
    slug: 'I-B-I2-CE',
    label: 'B.Sc. - 2. Sem. Computer Engineering',
  }, {
    id: 'SPLUSB3BC22',
    slug: 'I-B-I2-MI',
    label: 'B.Sc. - 2. Sem. Medieninformatik',
  }, {
    id: 'SPLUSB3BC20',
    slug: 'I-B-I2-SE',
    label: 'B.Sc. - 2. Sem. Software Engineering',
  }, {
    id: 'SPLUSB3BC1F',
    slug: 'I-B-I2-SysE',
    label: 'B.Sc. - 2. Sem. System Engineering',
  }, {
    id: 'SPLUS63AE5A',
    slug: 'I-B-I2-IE',
    label: 'B.Sc. - 2. Sem. Information Engineering',
  }, {
    id: 'SPLUSB3BC29',
    slug: 'I-B-I3-IE',
    label: 'B.Sc. - 3. Sem. Information Engineering',
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
