import { describe, expect, it } from 'vitest';
import {
  colorScale,
  customTimetableToRoute,
  deepEqual,
  range,
  roomWithoutLinks,
  scalarArraysEqual,
  shortenTimetableDegree,
  timetableDisplayName,
  truncateText,
  uniq,
} from '../../src/lib/util';

describe('util', () => {
  it('uniq removes duplicates', () => {
    expect(uniq([1, 2, 1, 3])).toEqual([1, 2, 3]);
  });

  it('scalarArraysEqual compares element by element', () => {
    expect(scalarArraysEqual(['a', 'b'], ['a', 'b'])).toBe(true);
    expect(scalarArraysEqual(['a', 'b'], ['b', 'a'])).toBe(false);
    expect(scalarArraysEqual(['a'], ['a', 'b'])).toBe(false);
  });

  it('range excludes the upper bound', () => {
    expect(range(2, 5)).toEqual([2, 3, 4]);
  });

  it('deepEqual compares nested objects', () => {
    expect(deepEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] })).toBe(true);
    expect(deepEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 3 }] })).toBe(false);
  });

  it('truncateText adds an ellipsis', () => {
    expect(truncateText('Informatik', 20)).toBe('Informatik');
    expect(truncateText('Wirtschaftsinformatik', 11)).toBe('Wirtschafts…');
  });

  it('timetableDisplayName keeps the semester', () => {
    const timetable = { label: 'Wirtschaftsinformatik', semester: 3 };
    expect(timetableDisplayName(timetable)).toBe(
      'Wirtschaftsinformatik 3. Sem.',
    );
    expect(timetableDisplayName(timetable, 11)).toBe('Wirtschafts… 3. Sem.');
    expect(timetableDisplayName({ label: 'A-Gebäude' })).toBe('A-Gebäude');
  });

  it('shortenTimetableDegree shortens known degrees', () => {
    expect(shortenTimetableDegree({ degree: 'Bachelor of Science' })).toBe(
      'B.Sc.',
    );
    expect(shortenTimetableDegree({ degree: 'Räume' })).toBe('Räume');
  });

  it('roomWithoutLinks removes the map links', () => {
    expect(
      roomWithoutLinks(
        'A209 (Am Exer 2, 38302 Wolfenbüttel) Link: https://example.org/1 / B107 Link: https://example.org/2',
      ),
    ).toBe('A209 (Am Exer 2, 38302 Wolfenbüttel) / B107');
    expect(roomWithoutLinks(undefined)).toBe('');
  });

  it('customTimetableToRoute describes the timetable in the query', () => {
    expect(
      customTimetableToRoute({
        id: ['a', 'b'],
        label: 'Mein Plan',
        whitelist: ['x'],
      }),
    ).toEqual({
      name: 'plan-timetable',
      params: {},
      query: { id: ['a', 'b'], course: ['x'], name: 'Mein Plan', v: '1' },
    });
  });
});

describe('colorScale', () => {
  it('should spread the colors from start to end', () => {
    expect(colorScale('#000000', '#ff8040', 3)).toEqual([
      '#000000',
      '#804020',
      '#ff8040',
    ]);
  });

  it('should return the middle color for a single color', () => {
    expect(colorScale('#000000', '#ff8040', 1)).toEqual(['#804020']);
  });

  it('should return no colors for no events', () => {
    expect(colorScale('#1976D2', '#004D40', 0)).toEqual([]);
  });
});
