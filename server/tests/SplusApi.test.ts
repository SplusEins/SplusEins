import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { TimetableRequest } from '../model/SplusEinsModel';
import { Source } from '../lib/timetables';
import { fixture, FIXTURE_WEEK, mockFetch } from './helpers';

type SplusApi = typeof import('../lib/SplusApi');

const request = (id: string): TimetableRequest => ({
  id,
  timetablePath: `https://stundenplan.ostfalia.de/${id}.html`,
  faculty: 'Bau-Wasser-Boden',
  type: 'graphical',
});
const source = (id: string, courses: Partial<Source> = {}): Source => ({
  timetable: request(id),
  ...courses,
});

describe('Test SplusApi', () => {
  let splusApi: SplusApi;

  beforeEach(async () => {
    mockFetch(async () => new Response(fixture('graphical.html')));
    vi.resetModules();
    splusApi = await import('../lib/SplusApi');
  });

  afterEach(() => vi.restoreAllMocks());

  it('should return the events of the requested week', async () => {
    const events = await splusApi.getEvents([source('a')], [FIXTURE_WEEK]);
    expect(events.map(({ title }) => title)).toEqual([
      'Zeile B & Co',
      'S-Modul 3 Prof. Dr. Schmidt',
      'B7',
      'Y',
      'Mathematik 1',
      'Y',
    ]);
  });

  it('should remove events which are in several timetables', async () => {
    const events = await splusApi.getEvents(
      [source('a'), source('b')],
      [FIXTURE_WEEK],
    );
    expect(events).toHaveLength(6);
    expect(events[0].sources).toEqual(['a', 'b']);
  });

  describe('with selected courses', () => {
    const idOf = async (title: string) =>
      (await splusApi.getUniqueEvents(request('a'))).find(
        (event) => event.title === title,
      )!.id;

    it('should leave out courses', async () => {
      const events = await splusApi.getEvents(
        [source('a', { except: [await idOf('Y'), await idOf('B7')] })],
        [FIXTURE_WEEK],
      );
      expect(events.map(({ title }) => title)).toEqual([
        'Zeile B & Co',
        'S-Modul 3 Prof. Dr. Schmidt',
        'Mathematik 1',
      ]);
    });

    it('should return only some courses', async () => {
      const events = await splusApi.getEvents(
        [source('a', { only: [await idOf('Y')] })],
        [FIXTURE_WEEK],
      );
      expect(events.map(({ title }) => title)).toEqual(['Y', 'Y']);
    });

    it('should name only the sources which contain the course', async () => {
      const [b7] = await splusApi.getEvents(
        [source('a', { only: [await idOf('B7')] }), source('b', { only: [] })],
        [FIXTURE_WEEK],
      );
      expect(b7.sources).toEqual(['a']);
    });

    it('should keep the color of a course when others are left out', async () => {
      const color = async (sources: Source[]) =>
        (await splusApi.getEvents(sources, [FIXTURE_WEEK])).find(
          ({ title }) => title === 'Mathematik 1',
        )!.colorIndex;
      expect(
        await color([source('a', { only: [await idOf('Mathematik 1')] })]),
      ).toBe(await color([source('a')]));
    });
  });

  it('should replace every &amp; in titles', async () => {
    mockFetch(
      async () =>
        new Response(
          fixture('graphical.html').replace(
            'Zeile B &amp; Co',
            'Zeile B &amp; C &amp; D',
          ),
        ),
    );
    const events = await splusApi.getEvents([source('a')], [FIXTURE_WEEK]);
    expect(events[0].title).toBe('Zeile B & C & D');
  });

  it('should return one event per lecture', async () => {
    const events = await splusApi.getUniqueEvents(request('a'));
    const ids = events.map(({ id }) => id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(events.filter(({ title }) => title === 'Y')).toHaveLength(1);
  });

  describe('with cache', () => {
    let cachePath: string;

    beforeEach(async () => {
      cachePath = mkdtempSync(join(tmpdir(), 'spluseins-cache-'));
      process.env.CACHE_PATH = cachePath;
      process.env.CACHE_DISABLE = '';
      vi.resetModules();
      splusApi = await import('../lib/SplusApi');
    });

    afterEach(() => {
      rmSync(cachePath, { recursive: true, force: true });
      process.env.CACHE_DISABLE = 'true';
    });

    it('should remove duplicates of cached and freshly loaded timetables', async () => {
      await splusApi.getEvents([source('a')], [FIXTURE_WEEK]);
      const events = await splusApi.getEvents(
        [source('a'), source('b')],
        [FIXTURE_WEEK],
      );
      expect(events).toHaveLength(6);
    });
  });
});
