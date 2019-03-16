export const state = () => ({
  /**
   * Dark theme active.
   */
  isDark: false,
  sidenavIsOpen: undefined,
});

export const mutations = {
  toggleDark(state) {
    state.isDark = !state.isDark;
  },
  toggleSidenav(state) {
    state.sidenavIsOpen = !state.sidenavIsOpen;
  },
  setSidenav(state, value) {
    state.sidenavIsOpen = value;
  },
};
