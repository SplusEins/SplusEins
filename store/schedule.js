export const state = () => ({
  schedule: {},
});

export const mutations = {
  setSchedule(state, schedule) {
    state.schedule = schedule;
  }
};
