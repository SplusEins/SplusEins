export const state = () => ({
  course: {
    id: 'SPLUS63AE5A',
    slug: 'I-B-I2-IE',
    label: 'B. Sc. - 2. Sem. Information Engineering',
  },
});

export const mutations = {
  setCourse(state, course) {
    state.course = course;
  }
};
