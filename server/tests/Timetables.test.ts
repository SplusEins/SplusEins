import { describe, it, expect } from 'vitest';
import TIMETABLES from '../assets/timetables.json';

describe('Test Timetables JSON', () => {
  const duplicates = (values: string[]) =>
    values.filter((value, index) => values.indexOf(value) !== index);

  it('should be defined', async () => {
    expect(TIMETABLES).toBeDefined();
  });

  it('should not include any duplicated ids', () => {
    expect(duplicates(TIMETABLES.map(({ id }) => id))).toEqual([]);
    expect(
      duplicates(TIMETABLES.map(({ timetablePath }) => timetablePath)),
    ).toEqual([]);
  });
});
