export const state = () => ({
  course: {
    id: 'SPLUS63AE5A',
    label: 'B. Sc. - 2. Sem. Information Engineering (I-B-I2-IE)',
  },
});

export const mutations = {
  setCourse(state, course) {
    state.course = course;
  }
};
