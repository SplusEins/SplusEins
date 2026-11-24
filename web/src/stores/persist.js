// Saves a part of the stores in the browser (localStorage), so that
// timetables and settings are still there on the next visit.
import { watch } from 'vue';
import { useUiStore } from './ui';
import { subscriptionKey, useSplusStore } from './splus';
import { useMensaStore } from './mensa';

const STORAGE_KEY = 'spluseins-state';
// Up to version 18 the data was saved here. It is only read, so that an older
// app version in another tab or after a rollback still finds its own data.
const LEGACY_STORAGE_KEY = 'spluseins';

/**
 * Format of the saved data. Saved timetables of older, unknown formats are
 * deleted. Timetables of past semesters do not need a new version, they are
 * dropped by forgetPastSemesters because their ids contain the semester.
 */
const VERSION = 19;

function readSavedState() {
  try {
    const saved =
      localStorage.getItem(STORAGE_KEY) ??
      localStorage.getItem(LEGACY_STORAGE_KEY);
    return JSON.parse(saved) || {};
  } catch (error) {
    // e.g. localStorage is blocked by the browser
    console.error('could not read saved state', error.message);
    return {};
  }
}

// version 18 saved copies of the timetables instead of their ids,
// anything broken is dropped by forgetPastSemesters
function migrateFrom18({
  customSchedules,
  favoriteSchedules,
  subscribedTimetable,
}) {
  return {
    customSchedules,
    favoriteIds: [].concat(favoriteSchedules ?? []).map((t) => t?.id),
    subscribedKey: subscribedTimetable?.id
      ? subscriptionKey(subscribedTimetable)
      : null,
  };
}

export function persistStores(pinia) {
  const ui = useUiStore(pinia);
  const splus = useSplusStore(pinia);
  const mensa = useMensaStore(pinia);

  // restore
  const saved = readSavedState();
  ui.$patch(saved.ui || {});
  mensa.$patch(saved.mensa || {});
  // broken saved timetables must not break the app
  try {
    if (saved.version === 18 && saved.splus) {
      saved.splus = migrateFrom18(saved.splus);
    } else if (saved.version < VERSION) {
      delete saved.splus;
    }
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
      customSchedules: splus.customSchedules,
      favoriteIds: splus.favoriteIds,
      subscribedKey: splus.subscribedKey,
    },
    mensa: {
      location: mensa.location,
      diet: mensa.diet,
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
    // also save right away, so that converted or dropped timetables are stored
    { deep: true, immediate: true },
  );
}
