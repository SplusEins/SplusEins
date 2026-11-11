import { describe, expect, it } from 'vitest';
import { overlappingCourseTitles, overlaps } from '../../src/lib/overlaps';

describe('overlaps', () => {
  it('detects lectures at the same time', () => {
    expect(overlaps({ begin: 8, duration: 2 }, { begin: 9, duration: 2 })).toBe(
      true,
    );
    expect(overlaps({ begin: 8, duration: 2 }, { begin: 8, duration: 1 })).toBe(
      true,
    );
    expect(overlaps({ begin: 8, duration: 4 }, { begin: 9, duration: 1 })).toBe(
      true,
    );
  });

  it('allows lectures right after each other', () => {
    expect(
      overlaps({ begin: 8, duration: 2 }, { begin: 10, duration: 2 }),
    ).toBe(false);
  });
});

describe('overlappingCourseTitles', () => {
  const lecture = (titleId, start, begin, duration = 1.5) => ({
    titleId,
    title: `Vorlesung ${titleId}`,
    organiserShortname: 'X',
    room: 'A1',
    start,
    begin,
    duration,
  });

  it('returns selected courses which overlap on the same day', () => {
    const lectures = [
      lecture('a', '2026-11-09T07:15:00Z', 8.25),
      lecture('b', '2026-11-09T08:00:00Z', 9),
      lecture('c', '2026-11-10T08:00:00Z', 9),
    ];
    expect(
      overlappingCourseTitles(lectures, [
        { titleId: 'a' },
        { titleId: 'b' },
        { titleId: 'c' },
      ]),
    ).toEqual(['Vorlesung a', 'Vorlesung b']);
  });

  it('ignores courses which are not selected or on other days', () => {
    const lectures = [
      lecture('a', '2026-11-09T07:15:00Z', 8.25),
      lecture('b', '2026-11-09T08:00:00Z', 9),
      lecture('c', '2026-11-10T07:15:00Z', 8.25),
    ];
    expect(
      overlappingCourseTitles(lectures, [{ titleId: 'a' }, { titleId: 'c' }]),
    ).toEqual([]);
  });

  it('does not count a lecture which is in two timetables', () => {
    const lectures = [
      lecture('a', '2026-11-09T07:15:00Z', 8.25),
      lecture('a', '2026-11-09T07:15:00Z', 8.25),
    ];
    expect(overlappingCourseTitles(lectures, [{ titleId: 'a' }])).toEqual([]);
  });
});
