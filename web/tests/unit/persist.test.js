import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { createPinia } from 'pinia';
import { persistStores } from '../../src/stores/persist';
import { useUiStore } from '../../src/stores/ui';
import { useSplusStore } from '../../src/stores/splus';
import TIMETABLES from '../../src/assets/timetables.json';

const [timetable] = TIMETABLES;
const custom = { id: [timetable.id], label: 'Plan', whitelist: ['x'] };

const STORAGE_KEY = 'spluseins-state';
const LEGACY_STORAGE_KEY = 'spluseins';

function stubLocalStorage(items = {}) {
  const storage = {
    getItem: (key) => items[key] ?? null,
    setItem: (key, value) => (items[key] = value),
  };
  vi.stubGlobal('localStorage', storage);
  return items;
}

const saved = (items) => JSON.parse(items[STORAGE_KEY]);

describe('persistStores', () => {
  let pinia;

  beforeEach(() => {
    vi.unstubAllGlobals();
    pinia = createPinia();
  });

  it('restores the saved settings and timetables', () => {
    stubLocalStorage({
      [STORAGE_KEY]: JSON.stringify({
        version: 19,
        ui: { isDark: true },
        splus: { favoriteIds: [timetable.id], subscribedKey: timetable.id },
      }),
    });
    persistStores(pinia);
    expect(useUiStore(pinia).isDark).toBe(true);
    expect(useSplusStore(pinia).favoriteIds).toEqual([timetable.id]);
    expect(useSplusStore(pinia).subscribedTimetable.id).toBe(timetable.id);
  });

  it('converts the timetables saved by version 18', () => {
    const items = stubLocalStorage({
      [LEGACY_STORAGE_KEY]: JSON.stringify({
        version: 18,
        splus: {
          customSchedules: { Plan: custom },
          favoriteSchedules: [timetable],
          subscribedTimetable: custom,
        },
      }),
    });
    persistStores(pinia);
    const splus = useSplusStore(pinia);
    expect(splus.favoriteIds).toEqual([timetable.id]);
    expect(splus.subscribedTimetable).toEqual(custom);
    expect(saved(items).splus).toEqual({
      customSchedules: { Plan: custom },
      favoriteIds: [timetable.id],
      subscribedKey: 'custom:Plan',
    });
  });

  it('converts incomplete data of version 18', () => {
    stubLocalStorage({
      [LEGACY_STORAGE_KEY]: JSON.stringify({
        version: 18,
        ui: { isDark: true },
        splus: {
          customSchedules: null,
          favoriteSchedules: [null, timetable],
          subscribedTimetable: null,
        },
      }),
    });
    persistStores(pinia);
    const splus = useSplusStore(pinia);
    expect(useUiStore(pinia).isDark).toBe(true);
    expect(splus.favoriteIds).toEqual([timetable.id]);
    expect(splus.subscribedTimetable.id).toBe(timetable.id);
  });

  it('starts without timetables if the saved ones cannot be read', () => {
    stubLocalStorage({
      [STORAGE_KEY]: JSON.stringify({
        version: 19,
        ui: { isDark: true },
        splus: { favoriteIds: 'broken', customSchedules: { Plan: custom } },
      }),
    });
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    persistStores(pinia);
    const splus = useSplusStore(pinia);
    expect(useUiStore(pinia).isDark).toBe(true);
    expect(splus.favoriteIds).toEqual([]);
    expect(splus.customSchedules).toEqual({});
  });

  it('drops broken timetables of version 18 but keeps the settings', () => {
    stubLocalStorage({
      [LEGACY_STORAGE_KEY]: JSON.stringify({
        version: 18,
        ui: { isDark: true },
        splus: { customSchedules: 'broken', favoriteSchedules: 'broken' },
      }),
    });
    persistStores(pinia);
    const splus = useSplusStore(pinia);
    expect(useUiStore(pinia).isDark).toBe(true);
    expect(splus.favoriteIds).toEqual([]);
    expect(splus.customSchedules).toEqual({});
  });

  it('leaves the data of version 18 for older app versions', async () => {
    const legacy = JSON.stringify({
      version: 18,
      splus: { favoriteSchedules: [timetable] },
    });
    const items = stubLocalStorage({ [LEGACY_STORAGE_KEY]: legacy });
    persistStores(pinia);
    useUiStore(pinia).toggleDark();
    await nextTick();
    expect(items[LEGACY_STORAGE_KEY]).toBe(legacy);
  });

  it('prefers the data of the current version', () => {
    stubLocalStorage({
      [LEGACY_STORAGE_KEY]: JSON.stringify({
        version: 18,
        splus: { favoriteSchedules: [] },
      }),
      [STORAGE_KEY]: JSON.stringify({
        version: 19,
        splus: { favoriteIds: [timetable.id] },
      }),
    });
    persistStores(pinia);
    expect(useSplusStore(pinia).favoriteIds).toEqual([timetable.id]);
  });

  it('forgets timetables of past semesters', () => {
    stubLocalStorage({
      [STORAGE_KEY]: JSON.stringify({
        version: 19,
        splus: { favoriteIds: ['old_ss25', timetable.id] },
      }),
    });
    persistStores(pinia);
    expect(useSplusStore(pinia).favoriteIds).toEqual([timetable.id]);
  });

  it('deletes the timetables of an unknown older version but keeps the settings', () => {
    stubLocalStorage({
      [LEGACY_STORAGE_KEY]: JSON.stringify({
        version: 17,
        ui: { isDark: true },
        splus: { favoriteIds: [timetable.id] },
      }),
    });
    persistStores(pinia);
    expect(useUiStore(pinia).isDark).toBe(true);
    expect(useSplusStore(pinia).favoriteIds).toEqual([]);
  });

  it('starts empty if the saved data is broken', () => {
    stubLocalStorage({ [STORAGE_KEY]: '{broken' });
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    persistStores(pinia);
    expect(useUiStore(pinia).isDark).toBe(false);
  });

  it('saves changes of the selected values', async () => {
    const items = stubLocalStorage();
    persistStores(pinia);
    useUiStore(pinia).toggleDark();
    useSplusStore(pinia).addFavoriteSchedule(timetable);
    await nextTick();
    expect(saved(items)).toEqual(
      expect.objectContaining({
        version: 19,
        ui: { isDark: true, hasSeenDisclaimer: false },
        splus: expect.objectContaining({
          favoriteIds: [timetable.id],
          subscribedKey: timetable.id,
        }),
      }),
    );
  });

  it('does not save other changes', async () => {
    const items = stubLocalStorage();
    persistStores(pinia);
    const before = items[STORAGE_KEY];
    useSplusStore(pinia).events = [{ title: 'Vorlesung' }];
    await nextTick();
    expect(items[STORAGE_KEY]).toBe(before);
  });
});
