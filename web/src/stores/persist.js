// Saves a part of the stores in the browser (localStorage), so that
// timetables and settings are still there on the next visit.
import { watch } from 'vue';
import { useUiStore } from './ui';
import { useSplusStore } from './splus';
import { useMensaStore } from './mensa';

const STORAGE_KEY = 'spluseins';

/**
 * Version of the saved data.
 * When it is incremented, saved timetables of all users are deleted.
 */
const VERSION = 18; // TODO Semesterwechsel increment this

function readSavedState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (error) {
    // e.g. localStorage is blocked by the browser
    console.error('could not read saved state', error.message);
    return {};
  }
}

export function persistStores(pinia) {
  const ui = useUiStore(pinia);
  const splus = useSplusStore(pinia);
  const mensa = useMensaStore(pinia);

  // restore
  const saved = readSavedState();
  if (saved.version < VERSION) {
    // timetables of the previous semester do not exist anymore
    delete saved.splus;
  }
  ui.$patch(saved.ui || {});
  splus.$patch(saved.splus || {});
  mensa.$patch(saved.mensa || {});

  // save when one of the saved values changes
  const savedState = () => ({
    version: VERSION,
    /* select items to be saved - must not change the structure! */
    ui: {
      isDark: ui.isDark,
      hasSeenDisclaimer: ui.hasSeenDisclaimer,
    },
    splus: {
      customSchedules: splus.customSchedules,
      favoriteSchedules: splus.favoriteSchedules,
      subscribedTimetable: splus.subscribedTimetable,
    },
    mensa: {
      location: mensa.location,
    },
  });
  watch(
    savedState,
    (state) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.error('could not save state', error.message);
      }
    },
    { deep: true },
  );
}
