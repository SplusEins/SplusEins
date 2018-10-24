export const state = () => ({
  course: {},
});

export const mutations = {
  setCourse(state, course) {
    state.course = course;
  }
};
