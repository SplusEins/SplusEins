import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { TimetableRequest } from '../model/SplusEinsModel';
import { fixture, FIXTURE_WEEK, mockFetch } from './helpers';

type SplusApi = typeof import('../lib/SplusApi');

const request = (id: string): TimetableRequest => ({
  id,
  week: FIXTURE_WEEK,
  timetablePath: `https://stundenplan.ostfalia.de/${id}.html`,
  faculty: 'Bau-Wasser-Boden',
  type: 'graphical',
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
    const events = await splusApi.getEvents([request('a')]);
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
    const events = await splusApi.getEvents([request('a'), request('b')]);
    expect(events).toHaveLength(6);
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
    const events = await splusApi.getEvents([request('a')]);
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
      await splusApi.getEvents([request('a')]);
      const events = await splusApi.getEvents([request('a'), request('b')]);
      expect(events).toHaveLength(6);
    });
  });
});
