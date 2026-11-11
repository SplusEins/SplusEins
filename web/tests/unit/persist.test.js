import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { createPinia } from 'pinia';
import { persistStores } from '../../src/stores/persist';
import { useUiStore } from '../../src/stores/ui';
import { useSplusStore } from '../../src/stores/splus';

const STORAGE_KEY = 'spluseins';

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
        version: 18,
        ui: { isDark: true },
        splus: { favoriteSchedules: [{ id: 'a' }] },
      }),
    });
    persistStores(pinia);
    expect(useUiStore(pinia).isDark).toBe(true);
    expect(useSplusStore(pinia).favoriteSchedules).toEqual([{ id: 'a' }]);
  });

  it('deletes the timetables of an older version but keeps the settings', () => {
    stubLocalStorage({
      [STORAGE_KEY]: JSON.stringify({
        version: 17,
        ui: { isDark: true },
        splus: { favoriteSchedules: [{ id: 'a' }] },
      }),
    });
    persistStores(pinia);
    expect(useUiStore(pinia).isDark).toBe(true);
    expect(useSplusStore(pinia).favoriteSchedules).toEqual([]);
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
    useSplusStore(pinia).addFavoriteSchedule({ id: 'a' });
    await nextTick();
    expect(saved(items)).toEqual(
      expect.objectContaining({
        version: 18,
        ui: { isDark: true, hasSeenDisclaimer: false },
        splus: expect.objectContaining({ favoriteSchedules: [{ id: 'a' }] }),
      }),
    );
  });

  it('does not save other changes', async () => {
    const items = stubLocalStorage();
    persistStores(pinia);
    useSplusStore(pinia).events = [{ title: 'Vorlesung' }];
    await nextTick();
    expect(items[STORAGE_KEY]).toBeUndefined();
  });
});
