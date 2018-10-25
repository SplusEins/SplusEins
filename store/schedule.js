export const state = () => ({
  course: {},
});

export const mutations = {
  setSchedule(state, schedule) {
    state.schedule = schedule;
  }
};
