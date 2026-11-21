import { describe, expect, it } from 'vitest';
import {
  customTimetableToRoute,
  semesterLabel,
  timetableDisplayName,
  truncateText,
  uniq,
} from '../../src/lib/util';

describe('util', () => {
  it('uniq removes duplicates', () => {
    expect(uniq([1, 2, 1, 3])).toEqual([1, 2, 3]);
  });

  it('semesterLabel names only numbered semesters', () => {
    expect(semesterLabel(3)).toBe('3. Sem.');
    expect(semesterLabel('WPF')).toBe('');
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
