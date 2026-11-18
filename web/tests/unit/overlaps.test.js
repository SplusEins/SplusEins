import { describe, expect, it } from 'vitest';
import { overlappingCourseTitles, overlaps } from '../../src/lib/overlaps';

const at = (hours) => new Date(Date.UTC(2026, 10, 9) + hours * 3600000);
const slot = (begin, duration) => ({
  start: at(begin).toISOString(),
  end: at(begin + duration).toISOString(),
});

describe('overlaps', () => {
  it('detects lectures at the same time', () => {
    expect(overlaps(slot(8, 2), slot(9, 2))).toBe(true);
    expect(overlaps(slot(8, 2), slot(8, 1))).toBe(true);
    expect(overlaps(slot(8, 4), slot(9, 1))).toBe(true);
  });

  it('allows lectures right after each other', () => {
    expect(overlaps(slot(8, 2), slot(10, 2))).toBe(false);
  });

  it('ignores lectures at the same time on other days', () => {
    expect(overlaps(slot(8, 2), slot(24 + 8, 2))).toBe(false);
  });
});

describe('overlappingCourseTitles', () => {
  const lecture = (id, start, duration = 1.5) => ({
    id,
    title: `Vorlesung ${id}`,
    meta: { organiserShortname: 'X' },
    location: 'A1',
    start,
    end: new Date(Date.parse(start) + duration * 3600000).toISOString(),
  });

  it('returns selected courses which overlap on the same day', () => {
    const lectures = [
      lecture('a', '2026-11-09T07:15:00Z'),
      lecture('b', '2026-11-09T08:00:00Z'),
      lecture('c', '2026-11-10T08:00:00Z'),
    ];
    expect(
      overlappingCourseTitles(lectures, [
        { id: 'a' },
        { id: 'b' },
        { id: 'c' },
      ]),
    ).toEqual(['Vorlesung a', 'Vorlesung b']);
  });

  it('ignores courses which are not selected or on other days', () => {
    const lectures = [
      lecture('a', '2026-11-09T07:15:00Z'),
      lecture('b', '2026-11-09T08:00:00Z'),
      lecture('c', '2026-11-10T07:15:00Z'),
    ];
    expect(
      overlappingCourseTitles(lectures, [{ id: 'a' }, { id: 'c' }]),
    ).toEqual([]);
  });

  it('does not count a lecture which is in two timetables', () => {
    const lectures = [
      lecture('a', '2026-11-09T07:15:00Z'),
      lecture('a', '2026-11-09T07:15:00Z'),
    ];
    expect(overlappingCourseTitles(lectures, [{ id: 'a' }])).toEqual([]);
  });
});
