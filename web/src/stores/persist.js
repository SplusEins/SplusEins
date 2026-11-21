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
 * Version of the saved data.
 * When it is incremented, saved timetables of all users are deleted.
 */
const VERSION = 19; // TODO Semesterwechsel increment this

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

// version 18 saved copies of the timetables instead of their ids
function migrateFrom18({
  customSchedules = {},
  favoriteSchedules = [],
  subscribedTimetable = {},
}) {
  return {
    customSchedules,
    favoriteIds: favoriteSchedules.map(({ id }) => id),
    subscribedKey:
      Object.keys(subscribedTimetable).length > 0
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
  if (saved.version === 18 && saved.splus) {
    saved.splus = migrateFrom18(saved.splus);
  } else if (saved.version < VERSION) {
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
      favoriteIds: splus.favoriteIds,
      subscribedKey: splus.subscribedKey,
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
    // also save right away, so that converted timetables are stored
    { deep: true, immediate: true },
  );
}
