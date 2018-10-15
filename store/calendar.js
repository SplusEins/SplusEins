// TODO support year transition
export const state = () => ({
  week: 0,
});

export const mutations = {
  setWeek(state, week) {
    state.week = week;
  },
};
