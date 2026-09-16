export const state = () => ({
  /**
   * Dark theme active.
   */
  isDark: false,
  sidenavIsOpen: undefined,
  /**
   * Whether the "Inoffiziell" Disclaimer at first launch has been dismissed
   */
  hasSeenDisclaimer: false,
});

export const mutations = {
  toggleDark(state, setCookie) {
    state.isDark = !state.isDark;
    if (setCookie) {
      document.cookie = `dark=${state.isDark}; expires=${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)};`;
    }
  },
  toggleSidenav(state) {
    state.sidenavIsOpen = !state.sidenavIsOpen;
  },
  setSidenav(state, value) {
    state.sidenavIsOpen = value;
  },
  dismissDisclaimer(state) {
    state.hasSeenDisclaimer = true;
  },
};
