import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import App from '../App';
import {
  fixture,
  FIXTURE_WEEK,
  graphicalTimetables,
  mockFetch,
} from './helpers';

const app = new App('/api').app;
const [timetable, otherTimetable] = graphicalTimetables;

beforeEach(() => {
  // a day in the week of the lectures in the fixtures
  // only the date is fixed, timers are needed by the server
  vi.useFakeTimers({ now: new Date('2026-11-10T12:00:00Z'), toFake: ['Date'] });
  vi.spyOn(console, 'log').mockImplementation(() => undefined);
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('splus', () => {
  const titleIdOf = async (title: string) => {
    const response = await request(app).get(
      `/api/splus/${timetable.id}/lectures`,
    );
    return response.body.find((event) => event.title === title).id;
  };

  beforeEach(() => {
    mockFetch(async () => new Response(fixture('graphical.html')));
  });

  it('should return the timetable of a week', async () => {
    const response = await request(app)
      .get(`/api/splus/${timetable.id}/${FIXTURE_WEEK}`)
      .expect(200);
    expect(response.body.events).toHaveLength(6);
    expect(response.body.meta.id).toBe(timetable.id);
  });

  it('should return the lectures of a timetable', async () => {
    const response = await request(app)
      .get(`/api/splus/${timetable.id}/lectures`)
      .expect(200);
    expect(response.body.map(({ title }) => title)).toContain('Mathematik 1');
  });

  it('should return a personal timetable with selected lectures', async () => {
    const titleId = await titleIdOf('Mathematik 1');
    const response = await request(app)
      .get(
        `/api/splus/${timetable.id},${otherTimetable.id}/${FIXTURE_WEEK}/${titleId}/Mein%20Plan`,
      )
      .expect(200);
    expect(response.body.name).toBe('Mein Plan');
    expect(response.body.events.map(({ title }) => title)).toEqual([
      'Mathematik 1',
    ]);
  });

  it('should return a personal timetable without selected lectures', async () => {
    const response = await request(app)
      .get(`/api/splus/${timetable.id}/${FIXTURE_WEEK}/Mein%20Plan`)
      .expect(200);
    expect(response.body.name).toBe('Mein Plan');
    expect(response.body.events).toHaveLength(6);
  });

  it('should answer 404 for unknown timetables', async () => {
    await request(app).get(`/api/splus/unknown/${FIXTURE_WEEK}`).expect(404);
  });

  it('should answer 404 if the Ostfalia does not have the timetable', async () => {
    mockFetch(async () => new Response('', { status: 404 }));
    await request(app)
      .get(`/api/splus/${timetable.id}/${FIXTURE_WEEK}`)
      .expect(404);
  });

  it('should not send internal error details', async () => {
    mockFetch(async () => {
      throw new Error('internal detail');
    });
    const response = await request(app)
      .get(`/api/splus/${timetable.id}/${FIXTURE_WEEK}`)
      .expect(500);
    expect(response.text).not.toContain('internal detail');
  });

  describe('ics', () => {
    it('should return a calendar of the next weeks', async () => {
      const response = await request(app)
        .get(`/api/ics/v1/${timetable.id}`)
        .expect(200);
      expect(response.text).toContain('BEGIN:VCALENDAR');
      expect(response.text).toContain('SUMMARY:Mathematik 1');
      expect(response.text).toContain('SUMMARY:B7');
    });

    it('should return a calendar of selected lectures', async () => {
      const titleId = await titleIdOf('Mathematik 1');
      const response = await request(app)
        .get(`/api/ics/v1/${timetable.id},${otherTimetable.id}/${titleId}`)
        .expect(200);
      expect(response.text).toContain('SUMMARY:Mathematik 1');
      expect(response.text).not.toContain('SUMMARY:B7');
    });

    it('should answer 404 for unknown timetables', async () => {
      await request(app).get('/api/ics/v1/unknown').expect(404);
    });
  });
});

describe('mensa', () => {
  const STW_API = 'https://sls.api.stw-on.de/v1/location/';

  const location = (id: number) => ({
    id,
    name: `Mensa ${id}`,
    address: { city: 'Wolfenbüttel', line1: '', line2: '', street: '', zip: 1 },
    opening_hours: [
      {
        time: 'noon',
        start_day: 1,
        end_day: 5,
        start_time: '11:00:00',
        end_time: '14:00:00',
      },
    ],
  });
  const menu = {
    meals: [
      {
        date: '2026-11-11',
        name: 'Nudeln',
        price: { student: '2', employee: '3', guest: '4' },
        lane: { name: 'Essen 1' },
        tags: { categories: [{ name: 'Vegan' }] },
      },
      {
        date: '2026-11-10',
        name: 'Reis',
        price: { student: '2', employee: '3', guest: '4' },
        lane: { name: 'Essen 2' },
        tags: { categories: [] },
      },
    ],
  };

  const stwApi = (fail: (id: number) => Error | Response | undefined) =>
    mockFetch(async (url) => {
      const [id, isMenu] = url.replace(STW_API, '').split('/');
      const failure = fail(Number(id));
      if (failure instanceof Error) throw failure;
      if (failure) return failure;
      return Response.json(isMenu ? menu : location(Number(id)));
    });

  it('should return all mensas with their meals per day', async () => {
    stwApi(() => undefined);
    const response = await request(app).get('/api/mensa').expect(200);
    expect(response.body).toHaveLength(4);
    expect(response.body[0].dayPlans.map(({ date }) => date)).toEqual([
      '2026-11-10',
      '2026-11-11',
    ]);
    expect(response.headers['cache-control']).toContain('max-age');
  });

  it('should leave out mensas which could not be loaded', async () => {
    stwApi((id) =>
      id === 130 ? new Response('', { status: 500 }) : undefined,
    );
    const response = await request(app).get('/api/mensa').expect(200);
    expect(response.body.map(({ id }) => id)).toEqual([112, 200, 134]);
    expect(response.headers['cache-control']).toBe('no-cache');
  });

  it('should answer 504 if the STW-ON API times out', async () => {
    // like the error of AbortSignal.timeout()
    stwApi(() => Object.assign(new Error('timeout'), { name: 'TimeoutError' }));
    await request(app).get('/api/mensa').expect(504);
  });

  it('should answer 500 if no mensa could be loaded', async () => {
    stwApi(() => new Error('fetch failed'));
    await request(app).get('/api/mensa').expect(500);
  });
});

it('should answer 404 for unknown paths', async () => {
  const response = await request(app).get('/api/unknown').expect(404);
  expect(response.text).toBe('Invalid API called');
});
