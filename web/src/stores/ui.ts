import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', {
  state: () => ({
    /**
     * Dark theme active.
     */
    isDark: false,
    sidenavIsOpen: undefined as boolean | undefined,
    /**
     * Whether the "Inoffiziell" Disclaimer at first launch has been dismissed
     */
    hasSeenDisclaimer: false,
    // not persisted; the dialog is in App.vue so closing a menu cannot unmount it
    aboutIsOpen: false,
  }),
  actions: {
    toggleDark() {
      this.isDark = !this.isDark;
    },
    toggleSidenav() {
      this.sidenavIsOpen = !this.sidenavIsOpen;
    },
    setSidenav(value: boolean) {
      this.sidenavIsOpen = value;
    },
    dismissDisclaimer() {
      this.hasSeenDisclaimer = true;
    },
  },
});
