import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import TIMETABLES from '../../src/assets/timetables.json';
import { useSplusStore } from '../../src/stores/splus';
import { useAppStore } from '../../src/stores/app';

const [timetable, otherTimetable] = TIMETABLES;
const custom = (label, id = [timetable.id]) => ({
  id,
  label,
  whitelist: ['x'],
});

describe('splus store', () => {
  let splus;

  beforeEach(() => {
    setActivePinia(createPinia());
    splus = useSplusStore();
  });

  afterEach(() => vi.unstubAllGlobals());

  describe('subscribed timetable', () => {
    it('is the first saved timetable', () => {
      splus.addFavoriteSchedule(timetable);
      splus.addCustomSchedule(custom('Mein Plan'));
      expect(splus.subscribedTimetable).toEqual(timetable);
    });

    it('moves to the next timetable when it is removed', () => {
      splus.addFavoriteSchedule(timetable);
      splus.addCustomSchedule(custom('Mein Plan'));
      splus.removeFavoriteSchedule(timetable);
      expect(splus.subscribedTimetable.label).toBe('Mein Plan');

      splus.deleteCustomSchedule(custom('Mein Plan'));
      expect(splus.subscribedTimetable).toEqual({});
    });

    it('stays when another timetable is removed', () => {
      splus.addFavoriteSchedule(timetable);
      splus.addFavoriteSchedule(otherTimetable);
      splus.removeFavoriteSchedule(otherTimetable);
      expect(splus.subscribedTimetable).toEqual(timetable);
    });
  });

  it('adds each favorite only once', () => {
    splus.addFavoriteSchedule(timetable);
    splus.addFavoriteSchedule({ ...timetable });
    expect(splus.favoriteSchedules).toHaveLength(1);
  });

  it('never overwrites a custom timetable', () => {
    splus.addCustomSchedule(custom('Mein Plan'));
    splus.addCustomSchedule(custom('Mein Plan', [otherTimetable.id]));
    expect(splus.customSchedules['Mein Plan'].id).toEqual([timetable.id]);
  });

  describe('importSchedule', () => {
    it('opens a regular timetable', () => {
      splus.importSchedule({ params: { timetable: timetable.id }, query: {} });
      expect(splus.schedule.id).toBe(timetable.id);
      expect(splus.isCustomTimetable).toBe(false);
    });

    it('opens and saves a personal timetable', () => {
      splus.importSchedule({
        params: {},
        query: { v: '1', id: timetable.id, course: 'x', name: 'Mein Plan' },
      });
      expect(splus.schedule).toEqual({
        id: [timetable.id],
        label: 'Mein Plan',
        whitelist: ['x'],
      });
      expect(splus.isCustomTimetable).toBe(true);
      expect(splus.customTimetableLabels).toEqual(['Mein Plan']);
    });
  });

  it('groups the timetables by faculty, degree and semester', () => {
    const path = `${timetable.faculty} ${timetable.degree}`;
    expect(splus.getTimetablesAsTree[path][timetable.semester]).toContainEqual(
      expect.objectContaining({ id: timetable.id }),
    );
  });

  describe('load', () => {
    beforeEach(() => {
      splus.importSchedule({ params: { timetable: timetable.id }, query: {} });
      splus.resetWeek(false);
    });

    it('keeps only the response of the last request', async () => {
      const responses = [];
      vi.stubGlobal(
        'fetch',
        vi.fn(() => new Promise((resolve) => responses.push(resolve))),
      );

      const first = splus.load();
      const second = splus.load();
      responses[1](Response.json({ events: [{ title: 'new' }] }));
      await second;
      responses[0](Response.json({ events: [{ title: 'old' }] }));
      await first;

      expect(splus.events).toEqual([{ title: 'new' }]);
    });

    it('reports a missing timetable', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => new Response('', { status: 404 })),
      );
      await splus.load();
      expect(useAppStore().errorQueue).toEqual([
        'Dieser Plan existiert nicht (mehr).',
      ]);
    });
  });
});
