export const state = () => ({
  /**
   * Dark theme active.
   */
  isDark: false,
});

export const mutations = {
  toggleDark(state) {
    state.isDark = !state.isDark;
  },
};
