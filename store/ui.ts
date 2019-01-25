export const state = () => ({
  /**
   * Dark theme active.
   */
  isDark: false,
  sidenavIsOpen: false,
});

export const mutations = {
  toggleDark(state) {
    state.isDark = !state.isDark;
  },
  toggleSidenav(state) {
    state.sidenavIsOpen = !state.sidenavIsOpen;
    console.log("sidenavstatus", state.sidenavIsOpen);
  },
  setSidenav(state, value) {
    state.sidenavIsOpen = value;
    console.log("SET-sidenavstatus", state.sidenavIsOpen);
  },
};
