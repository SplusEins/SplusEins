export const state = () => ({
  /**
   * Currently viewed iso week of year.
   * Week 53 of year 2018 equals week 1 of year 2019.
   */
  week: 0,
});

export const mutations = {
  setWeek(state, week) {
    state.week = week;
  },
};
