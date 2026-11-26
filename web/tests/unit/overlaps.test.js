import { describe, expect, it } from 'vitest';
import { overlappingCourses, overlaps } from '../../src/lib/overlaps';

const course = (...slots) => ({ slots });
const slot = (day, start, end) => ({ day, start, end });

describe('overlaps', () => {
  it('detects courses at the same time of the week', () => {
    expect(
      overlaps(
        course(slot(1, '08:00', '09:30')),
        course(slot(1, '09:00', '10:30')),
      ),
    ).toBe(true);
    expect(
      overlaps(
        course(slot(1, '08:00', '12:00')),
        course(slot(1, '09:00', '10:00')),
      ),
    ).toBe(true);
  });

  it('compares every weekly time of a course', () => {
    expect(
      overlaps(
        course(slot(1, '08:00', '09:30'), slot(4, '13:00', '14:30')),
        course(slot(4, '14:00', '15:30')),
      ),
    ).toBe(true);
  });

  it('allows courses right after each other', () => {
    expect(
      overlaps(
        course(slot(1, '08:00', '09:30')),
        course(slot(1, '09:30', '11:00')),
      ),
    ).toBe(false);
  });

  it('ignores courses at the same time on other days', () => {
    expect(
      overlaps(
        course(slot(1, '08:00', '09:30')),
        course(slot(2, '08:00', '09:30')),
      ),
    ).toBe(false);
  });

  it('never reports block courses or courses without times', () => {
    expect(overlaps(course(), course(slot(1, '08:00', '09:30')))).toBe(false);
    expect(overlaps({}, course(slot(1, '08:00', '09:30')))).toBe(false);
  });
});

describe('overlappingCourses', () => {
  const lecture = (id, ...slots) => ({
    id,
    title: `Vorlesung ${id}`,
    slots,
  });

  it('returns selected courses which overlap', () => {
    const lectures = [
      lecture('a', slot(1, '08:15', '09:45')),
      lecture('b', slot(1, '09:00', '10:30')),
      lecture('c', slot(2, '09:00', '10:30')),
    ];
    expect(overlappingCourses(lectures, ['a', 'b', 'c'])).toEqual(
      new Map([
        ['a', 'Vorlesung b'],
        ['b', 'Vorlesung a'],
      ]),
    );
  });

  it('ignores courses which are not selected', () => {
    const lectures = [
      lecture('a', slot(1, '08:15', '09:45')),
      lecture('b', slot(1, '09:00', '10:30')),
    ];
    expect(overlappingCourses(lectures, ['a'])).toEqual(new Map());
  });

  it('does not count a lecture which is in two timetables', () => {
    const lectures = [
      lecture('a', slot(1, '08:15', '09:45')),
      lecture('a', slot(1, '08:15', '09:45')),
    ];
    expect(overlappingCourses(lectures, ['a'])).toEqual(new Map());
  });
});
