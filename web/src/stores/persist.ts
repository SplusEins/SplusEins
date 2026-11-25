// Saves a part of the stores in the browser (localStorage), so that
// timetables and settings are still there on the next visit.
import { watch } from 'vue';
import type { Pinia } from 'pinia';
import { useUiStore } from './ui';
import { subscriptionKey, useSplusStore } from './splus';
import { useMensaStore } from './mensa';
import type { AnyTimetable, CustomTimetable, Schedule } from '../types';

interface SavedSplus {
  customSchedules?: Record<string, CustomTimetable>;
  favoriteIds?: string[];
  subscribedKey?: string | null;
}

/* what version 18 saved */
interface SavedSplus18 {
  customSchedules?: Record<string, CustomTimetable>;
  favoriteSchedules?: Schedule | Schedule[] | null;
  subscribedTimetable?: AnyTimetable | null;
}

/* the saved data may be of any older version, or broken */
interface SavedState {
  version?: number;
  ui?: { isDark?: boolean; hasSeenDisclaimer?: boolean };
  splus?: SavedSplus;
  mensa?: { location?: string };
}

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : error;

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

function readSavedState(): SavedState {
  try {
    const saved =
      localStorage.getItem(STORAGE_KEY) ??
      localStorage.getItem(LEGACY_STORAGE_KEY);
    return (saved && (JSON.parse(saved) as SavedState | null)) || {};
  } catch (error) {
    // e.g. localStorage is blocked by the browser
    console.error('could not read saved state', errorMessage(error));
    return {};
  }
}

// version 18 saved copies of the timetables instead of their ids,
// anything broken is dropped by forgetPastSemesters
function migrateFrom18({
  customSchedules,
  favoriteSchedules,
  subscribedTimetable,
}: SavedSplus18): SavedSplus {
  return {
    customSchedules,
    favoriteIds: ([] as (Schedule | null | undefined)[])
      .concat(favoriteSchedules ?? [])
      .map((t) => t?.id)
      .filter((id) => id !== undefined),
    subscribedKey: subscribedTimetable?.id
      ? subscriptionKey(subscribedTimetable)
      : null,
  };
}

export function persistStores(pinia: Pinia) {
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
      saved.splus = migrateFrom18(saved.splus as SavedSplus18);
    } else if (saved.version !== undefined && saved.version < VERSION) {
      delete saved.splus;
    }
    splus.$patch(saved.splus || {});
    splus.forgetPastSemesters();
  } catch (error) {
    console.error('could not restore saved timetables', errorMessage(error));
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
    },
  });
  watch(
    savedState,
    (state) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.error('could not save state', errorMessage(error));
      }
    },
    // also save right away, so that converted or dropped timetables are stored
    { deep: true, immediate: true },
  );
}
