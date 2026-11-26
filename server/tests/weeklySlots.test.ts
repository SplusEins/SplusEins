import { describe, expect, it } from 'vitest';
import { weeklySlots } from '../lib/SplusApi';

// times in UTC, Berlin is UTC+1 in winter
const event = (start: string, end: string) => ({ start, end });

describe('weeklySlots', () => {
  it('returns the weekly time of a course in german time', () => {
    expect(
      weeklySlots([
        event('2026-11-09T07:00:00.000Z', '2026-11-09T08:30:00.000Z'),
        event('2026-11-16T07:00:00.000Z', '2026-11-16T08:30:00.000Z'),
      ]),
    ).toEqual([{ day: 1, start: '08:00', end: '09:30' }]);
  });

  it('returns every weekly time of a course', () => {
    expect(
      weeklySlots([
        event('2026-11-09T07:00:00.000Z', '2026-11-09T08:30:00.000Z'),
        event('2026-11-12T12:00:00.000Z', '2026-11-12T13:30:00.000Z'),
        event('2026-11-16T07:00:00.000Z', '2026-11-16T08:30:00.000Z'),
        event('2026-11-19T12:00:00.000Z', '2026-11-19T13:30:00.000Z'),
      ]),
    ).toEqual([
      { day: 1, start: '08:00', end: '09:30' },
      { day: 4, start: '13:00', end: '14:30' },
    ]);
  });

  it('ignores times which are only in one week', () => {
    expect(
      weeklySlots([
        event('2026-11-09T07:00:00.000Z', '2026-11-09T15:00:00.000Z'),
        event('2026-11-10T07:00:00.000Z', '2026-11-10T15:00:00.000Z'),
        // the same event twice, e.g. in two rows of the plan
        event('2026-11-23T07:00:00.000Z', '2026-11-23T08:30:00.000Z'),
        event('2026-11-23T07:00:00.000Z', '2026-11-23T08:30:00.000Z'),
      ]),
    ).toEqual([]);
  });
});
