import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { createPinia } from 'pinia';
import { persistStores } from '../../src/stores/persist';
import { useUiStore } from '../../src/stores/ui';
import { useSplusStore } from '../../src/stores/splus';
import TIMETABLES from '../../src/assets/timetables.json';

const [timetable] = TIMETABLES;
const plan = { name: 'Plan', sources: [{ id: timetable.id, only: ['x'] }] };

const STORAGE_KEY = 'spluseins-state';

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

  it('restores the saved settings and plans', () => {
    stubLocalStorage({
      [STORAGE_KEY]: JSON.stringify({
        version: 20,
        ui: { isDark: true },
        splus: { plans: [plan] },
      }),
    });
    persistStores(pinia);
    expect(useUiStore(pinia).isDark).toBe(true);
    expect(useSplusStore(pinia).plans).toEqual([plan]);
  });

  it('starts without plans if the saved ones cannot be read', () => {
    stubLocalStorage({
      [STORAGE_KEY]: JSON.stringify({
        version: 20,
        ui: { isDark: true },
        splus: { plans: 'broken' },
      }),
    });
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    persistStores(pinia);
    expect(useUiStore(pinia).isDark).toBe(true);
    expect(useSplusStore(pinia).plans).toEqual([]);
  });

  it('forgets timetables of past semesters', () => {
    stubLocalStorage({
      [STORAGE_KEY]: JSON.stringify({
        version: 20,
        splus: { plans: [{ sources: [{ id: 'old_ss25' }] }, plan] },
      }),
    });
    persistStores(pinia);
    expect(useSplusStore(pinia).plans).toEqual([plan]);
  });

  it('deletes the plans of older versions but keeps the settings', () => {
    stubLocalStorage({
      [STORAGE_KEY]: JSON.stringify({
        version: 19,
        ui: { isDark: true },
        splus: { favoriteIds: [timetable.id], plans: [plan] },
      }),
    });
    persistStores(pinia);
    expect(useUiStore(pinia).isDark).toBe(true);
    expect(useSplusStore(pinia).plans).toEqual([]);
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
    useSplusStore(pinia).toggleRemembered({ id: timetable.id });
    await nextTick();
    expect(saved(items)).toEqual(
      expect.objectContaining({
        version: 20,
        ui: { isDark: true, hasSeenDisclaimer: false },
        splus: { plans: [{ sources: [{ id: timetable.id }] }] },
      }),
    );
  });

  it('does not save other changes', async () => {
    const items = stubLocalStorage();
    persistStores(pinia);
    useUiStore(pinia).toggleDark();
    await nextTick();
    const before = items[STORAGE_KEY];
    expect(before).toBeDefined();
    useSplusStore(pinia).events = [{ title: 'Vorlesung' }];
    await nextTick();
    expect(items[STORAGE_KEY]).toBe(before);
  });
});
