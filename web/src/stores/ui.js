import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', {
  state: () => ({
    /**
     * Dark theme active.
     */
    isDark: false,
    sidenavIsOpen: undefined,
    /**
     * Whether the "Inoffiziell" Disclaimer at first launch has been dismissed
     */
    hasSeenDisclaimer: false,
  }),
  actions: {
    toggleDark() {
      this.isDark = !this.isDark;
    },
    toggleSidenav() {
      this.sidenavIsOpen = !this.sidenavIsOpen;
    },
    setSidenav(value) {
      this.sidenavIsOpen = value;
    },
    dismissDisclaimer() {
      this.hasSeenDisclaimer = true;
    },
  },
});
