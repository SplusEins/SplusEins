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
      expect(splus.subscribedTimetable.id).toBe(timetable.id);
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
      expect(splus.subscribedTimetable.id).toBe(timetable.id);
    });

    it('stays on a personal timetable when it is edited', () => {
      splus.addCustomSchedule(custom('Mein Plan'));
      splus.addFavoriteSchedule(timetable);
      splus.replaceCustomSchedule(custom('Mein Plan'), custom('Neuer Plan'));
      expect(splus.subscribedTimetable.label).toBe('Neuer Plan');
      expect(splus.customTimetableLabels).toEqual(['Neuer Plan']);
    });
  });

  it('knows the faculty of the subscribed timetable', () => {
    expect(splus.subscribedFaculty).toBeUndefined();
    splus.addCustomSchedule(custom('Mein Plan', [otherTimetable.id]));
    expect(splus.subscribedFaculty).toBe(otherTimetable.faculty);
    splus.addFavoriteSchedule(timetable);
    splus.deleteCustomSchedule(custom('Mein Plan', [otherTimetable.id]));
    expect(splus.subscribedFaculty).toBe(timetable.faculty);
  });

  it('forgets timetables which do not exist anymore', () => {
    splus.addFavoriteSchedule(timetable);
    splus.addFavoriteSchedule({ id: 'old_ss25' });
    splus.addCustomSchedule(custom('Alt', ['old_ss25']));
    splus.addCustomSchedule(custom('Gemischt', ['old_ss25', timetable.id]));
    splus.forgetUnknownTimetables();
    expect(splus.favoriteIds).toEqual([timetable.id]);
    expect(splus.customTimetableLabels).toEqual(['Gemischt']);
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

  it('shows sunday when there are events on sunday', () => {
    splus.events = [{ start: '2026-11-14T10:00' }];
    expect(splus.lastWeekday).toBe(6);
    splus.events = [{ start: '2026-11-15T10:00' }];
    expect(splus.lastWeekday).toBe(7);
    splus.events = [{ start: '2026-11-10T10:00' }];
    expect(splus.lastWeekday).toBe(5);
  });

  describe('loadAgendaEvents', () => {
    it('keeps only the response of the last request', async () => {
      const responses = [];
      vi.stubGlobal(
        'fetch',
        vi.fn(() => new Promise((resolve) => responses.push(resolve))),
      );
      splus.addFavoriteSchedule(timetable);

      const first = splus.loadAgendaEvents();
      const second = splus.loadAgendaEvents();
      responses[1](Response.json([{ title: 'new', meta: {} }]));
      await second;
      responses[0](Response.json([{ title: 'old', meta: {} }]));
      await first;

      expect(splus.agendaEvents.map(({ name }) => name)).toEqual(['new']);
    });
  });

  describe('showWeek', () => {
    beforeEach(() => {
      splus.importSchedule({ params: { timetable: timetable.id }, query: {} });
    });

    it('keeps only the response of the last request', async () => {
      const responses = [];
      vi.stubGlobal(
        'fetch',
        vi.fn(() => new Promise((resolve) => responses.push(resolve))),
      );

      const first = splus.showWeek('2026-11-09');
      const second = splus.showWeek('2026-11-16');
      responses[1](Response.json([{ title: 'new' }]));
      await second;
      responses[0](Response.json([{ title: 'old' }]));
      await first;

      expect(splus.events).toEqual([{ title: 'new' }]);
      expect(splus.week).toBe('2026-11-16');
    });

    it('changes the week only after the events are loaded', async () => {
      let respond;
      vi.stubGlobal(
        'fetch',
        vi.fn(() => new Promise((resolve) => (respond = resolve))),
      );
      splus.week = '2026-11-09';

      const loading = splus.showWeek('2026-11-16');
      expect(splus.week).toBe('2026-11-09');
      respond(Response.json([]));
      await loading;
      expect(splus.week).toBe('2026-11-16');
    });

    it('adds up quick moves to other weeks', async () => {
      const fetch = vi.fn(() => new Promise(() => {}));
      vi.stubGlobal('fetch', fetch);
      splus.showWeek('2026-11-09'); // week 46
      fetch.mockClear();

      splus.moveWeek(1);
      splus.moveWeek(1);
      expect(fetch.mock.calls.map(([url]) => url)).toEqual([
        `/api/splus/${timetable.id}/47`,
        `/api/splus/${timetable.id}/48`,
      ]);
    });

    it('reports a missing timetable', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => new Response('', { status: 404 })),
      );
      await splus.showWeek();
      expect(useAppStore().errorQueue).toEqual([
        'Dieser Plan existiert nicht (mehr).',
      ]);
    });
  });
});
