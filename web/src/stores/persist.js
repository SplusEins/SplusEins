// Saves a part of the stores in the browser (localStorage), so that
// timetables and settings are still there on the next visit.
import { watch } from 'vue';
import { useUiStore } from './ui';
import { useSplusStore } from './splus';
import { useMensaStore } from './mensa';

const STORAGE_KEY = 'spluseins-state';

/**
 * Format of the saved data. Saved plans of older formats are deleted.
 * Timetables of past semesters do not need a new version, they are dropped
 * by forgetPastSemesters because their ids contain the semester.
 */
const VERSION = 20;

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
  ui.$patch(saved.ui || {});
  mensa.$patch(saved.mensa || {});
  // broken saved plans must not break the app
  try {
    if (saved.version < VERSION) delete saved.splus;
    splus.$patch(saved.splus || {});
    splus.forgetPastSemesters();
  } catch (error) {
    console.error('could not restore saved timetables', error.message);
    splus.$reset();
  }

  // save when one of the saved values changes
  const savedState = () => ({
    version: VERSION,
    /* select items to be saved - must not change the structure! */
    ui: {
      isDark: ui.isDark,
      hasSeenDisclaimer: ui.hasSeenDisclaimer,
    },
    splus: {
      plans: splus.plans,
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
