import { describe, it, expect } from 'vitest';
import TIMETABLES from '../assets/timetables.json';
import { parseSources } from '../lib/timetables';

describe('parseSources', () => {
  const [a, b, c] = TIMETABLES;

  it('should read all, all except and only some courses', () => {
    expect(parseSources(`${a.id},${b.id}!x.y,${c.id}:z`)).toEqual([
      { timetable: a },
      { timetable: b, except: ['x', 'y'] },
      { timetable: c, only: ['z'] },
    ]);
  });

  it('should leave out unknown timetables', () => {
    expect(parseSources(`unknown!x,,${a.id}`)).toEqual([{ timetable: a }]);
    expect(parseSources('')).toEqual([]);
  });
});
