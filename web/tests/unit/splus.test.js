import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import TIMETABLES from '../../src/assets/timetables.json';
import { useSplusStore } from '../../src/stores/splus';
import { useAppStore } from '../../src/stores/app';
import { planKey } from '../../src/lib/plans';

const [timetable, otherTimetable] = TIMETABLES;
const remembered = (id = timetable.id) => ({ sources: [{ id }] });
const named = (name, sources = [{ id: timetable.id, only: ['x'] }]) => ({
  name,
  sources,
});
const keys = (plans) => plans.map(planKey);

describe('splus store', () => {
  let splus;

  beforeEach(() => {
    setActivePinia(createPinia());
    splus = useSplusStore();
  });

  afterEach(() => vi.unstubAllGlobals());

  describe('savePlan', () => {
    it('replaces the plan with the same key in place', () => {
      splus.toggleRemembered({ id: timetable.id });
      splus.toggleRemembered({ id: otherTimetable.id });
      const edited = { sources: [{ id: timetable.id, except: ['x'] }] };
      splus.savePlan(undefined, edited);
      expect(splus.plans).toEqual([edited, remembered(otherTimetable.id)]);
    });

    it('keeps the place of a renamed plan', () => {
      splus.savePlan(undefined, named('Mein Plan'));
      splus.toggleRemembered({ id: otherTimetable.id });
      splus.savePlan('Mein Plan', named('Neuer Plan'));
      expect(keys(splus.plans)).toEqual(['Neuer Plan', otherTimetable.id]);
    });

    it('replaces a plan which got the key of another', () => {
      splus.toggleRemembered({ id: timetable.id });
      splus.savePlan(undefined, named('Mein Plan'));
      splus.savePlan('Mein Plan', remembered());
      expect(splus.plans).toEqual([remembered()]);
    });
  });

  it('remembers a timetable only once', () => {
    splus.toggleRemembered({ id: timetable.id });
    expect(splus.isRemembered(timetable.id)).toBe(true);
    splus.savePlan(undefined, named('Mein Plan'));
    expect(splus.isRemembered(otherTimetable.id)).toBe(false);
    splus.toggleRemembered({ id: timetable.id });
    expect(splus.isRemembered(timetable.id)).toBe(false);
    expect(keys(splus.plans)).toEqual(['Mein Plan']);
  });

  it('adds a course to a plan', () => {
    splus.savePlan(undefined, named('Mein Plan'));
    splus.addCourse('Mein Plan', timetable.id, 'y');
    splus.addCourse('Mein Plan', otherTimetable.id, 'z');
    expect(splus.plans[0].sources).toEqual([
      { id: timetable.id, only: ['x', 'y'] },
      { id: otherTimetable.id, only: ['z'] },
    ]);
  });

  describe('forgetPastSemesters', () => {
    it('forgets timetables of past semesters', () => {
      splus.toggleRemembered({ id: timetable.id });
      splus.toggleRemembered({ id: 'old_ss25' });
      splus.savePlan(undefined, named('Alt', [{ id: 'old_ss25' }]));
      splus.savePlan(
        undefined,
        named('Gemischt', [{ id: 'old_ss25' }, { id: timetable.id }]),
      );
      splus.forgetPastSemesters();
      expect(splus.plans).toEqual([
        remembered(),
        named('Gemischt', [{ id: timetable.id }]),
      ]);
    });

    it('keeps unknown timetables of the current semester', () => {
      const gone = `gone${timetable.id.slice(timetable.id.lastIndexOf('_'))}`;
      splus.toggleRemembered({ id: gone });
      splus.forgetPastSemesters();
      expect(splus.plans).toEqual([remembered(gone)]);
    });

    it('forgets broken plans', () => {
      splus.plans = [{ name: 'Kaputt' }, null, { sources: [null] }];
      splus.forgetPastSemesters();
      expect(splus.plans).toEqual([]);
    });
  });

  describe('openPlan', () => {
    it('opens a timetable', () => {
      splus.openPlan({ params: { sources: timetable.id }, query: {} });
      expect(splus.schedule).toEqual(remembered());
      expect(splus.plans).toEqual([]);
    });

    it('opens a shared plan with a name without saving it', () => {
      splus.openPlan({
        params: { sources: `${timetable.id}:x,unknown` },
        query: { name: 'Mein Plan' },
      });
      expect(splus.schedule).toEqual(named('Mein Plan'));
      expect(splus.plans).toEqual([]);
    });

    it('opens nothing without known timetables', () => {
      splus.openPlan({ params: { sources: 'unknown' }, query: {} });
      expect(splus.schedule).toBeUndefined();
    });

    it('never shows the events of the plan opened before', () => {
      splus.openPlan({ params: { sources: timetable.id }, query: {} });
      splus.events = [{ title: 'old' }];
      splus.openPlan({ params: { sources: otherTimetable.id }, query: {} });
      expect(splus.events).toEqual([]);
    });

    it('cancels the request of the plan opened before', async () => {
      let respond;
      vi.stubGlobal(
        'fetch',
        vi.fn(() => new Promise((resolve) => (respond = resolve))),
      );
      splus.openPlan({ params: { sources: timetable.id }, query: {} });
      const loading = splus.showWeek('2026-11-16');
      splus.openPlan({ params: { sources: otherTimetable.id }, query: {} });
      expect(fetch.mock.calls[0][1].signal.aborted).toBe(true);
      respond(Response.json([{ title: 'old' }]));
      await loading;
      expect(splus.events).toEqual([]);
    });
  });

  describe('unsavedState', () => {
    const open = (sources, name) =>
      splus.openPlan({ params: { sources }, query: name ? { name } : {} });

    it('is empty for a timetable with all courses', () => {
      open(timetable.id);
      expect(splus.unsavedState).toBeUndefined();
    });

    it('asks to save a plan with a name or selected courses', () => {
      open(timetable.id, 'Mein Plan');
      expect(splus.unsavedState).toBe('unsaved');
      open(`${timetable.id}!x`);
      expect(splus.unsavedState).toBe('unsaved');
    });

    it('notices changes of a saved plan', () => {
      splus.savePlan(undefined, named('Mein Plan'));
      open(`${timetable.id}:x`, 'Mein Plan');
      expect(splus.unsavedState).toBeUndefined();
      open(`${timetable.id}:x.y`, 'Mein Plan');
      expect(splus.unsavedState).toBe('changed');
    });
  });

  it('finds the saved version of a timetable', () => {
    const hidden = { sources: [{ id: timetable.id, except: ['x'] }] };
    splus.savePlan(undefined, hidden);
    expect(splus.planByKey(timetable.id)).toEqual(hidden);
    expect(splus.planByKey(otherTimetable.id)).toBeUndefined();
  });

  it('knows the faculties of the saved plans', () => {
    expect(splus.savedFaculties).toEqual([]);
    const law = TIMETABLES.find(({ faculty }) => faculty === 'Recht');
    splus.savePlan(
      undefined,
      named('Mein Plan', [{ id: timetable.id }, { id: law.id }]),
    );
    splus.toggleRemembered({ id: otherTimetable.id });
    expect(splus.savedFaculties).toEqual([timetable.faculty, 'Recht']);
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
      splus.toggleRemembered({ id: timetable.id });

      const first = splus.loadAgendaEvents();
      const second = splus.loadAgendaEvents();
      responses[1](Response.json([{ title: 'new', meta: {} }]));
      await second;
      responses[0](Response.json([{ title: 'old', meta: {} }]));
      await first;

      expect(splus.agendaEvents.map(({ name }) => name)).toEqual(['new']);
    });

    it('keeps the events of the other plans when one fails', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.stubGlobal(
        'fetch',
        vi.fn(async (url) =>
          url.includes(otherTimetable.id)
            ? new Response('', { status: 500 })
            : Response.json([{ title: 'ok', meta: {} }]),
        ),
      );
      splus.toggleRemembered({ id: timetable.id });
      splus.toggleRemembered({ id: otherTimetable.id });

      await splus.loadAgendaEvents();

      expect(splus.agendaEvents.map(({ name }) => name)).toEqual(['ok']);
    });
  });

  describe('showWeek', () => {
    beforeEach(() => {
      splus.openPlan({ params: { sources: timetable.id }, query: {} });
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
