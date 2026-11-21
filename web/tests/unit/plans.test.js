import { describe, expect, it } from 'vitest';
import TIMETABLES from '../../src/assets/timetables.json';
import {
  parseSources,
  planDisplayName,
  planKey,
  planRoute,
  planSubtitle,
  sourcesToString,
  withCourse,
  withoutCourse,
} from '../../src/lib/plans';

const timetable = TIMETABLES.find(({ semester }) => semester === 3);

describe('plans', () => {
  it('reads and writes the sources of a URL', () => {
    const text = 'a,b!x.y,c:z,d:';
    const sources = [
      { id: 'a' },
      { id: 'b', except: ['x', 'y'] },
      { id: 'c', only: ['z'] },
      { id: 'd', only: [] },
    ];
    expect(parseSources(text)).toEqual(sources);
    expect(sourcesToString(sources)).toBe(text);
    expect(parseSources('a!,,')).toEqual([{ id: 'a' }]);
    expect(sourcesToString([{ id: 'a', except: [] }])).toBe('a');
  });

  it('describes a timetable with hidden courses', () => {
    const plan = { sources: [{ id: timetable.id, except: ['x'] }] };
    expect(planKey(plan)).toBe(timetable.id);
    expect(planRoute(plan)).toEqual({
      name: 'plan',
      params: { sources: `${timetable.id}!x` },
      query: {},
    });
    expect(planDisplayName(plan)).toBe(`${timetable.label} 3. Sem.`);
    expect(planSubtitle(plan)).toBe(
      `3. Semester · ${timetable.faculty} ${timetable.degree} · 1 Kurs ausgeblendet`,
    );
  });

  it('describes a plan with a name', () => {
    const plan = {
      name: 'Mein Plan',
      sources: [
        { id: 'a', only: ['x', 'y'] },
        { id: 'b', only: ['z'] },
      ],
    };
    expect(planKey(plan)).toBe('Mein Plan');
    expect(planRoute(plan).query).toEqual({ name: 'Mein Plan' });
    expect(planDisplayName(plan, 4)).toBe('Mein…');
    expect(planSubtitle(plan)).toBe('Eigener Plan · aus 2 Plänen');
    expect(planSubtitle({ ...plan, sources: [{ id: 'a' }] })).toBe(
      'Eigener Plan · aus 1 Plan',
    );
  });

  it('hides a course and adds it again', () => {
    const plan = { sources: [{ id: 'a' }] };
    const hidden = withoutCourse(plan, 'x', ['a']);
    expect(hidden.sources).toEqual([{ id: 'a', except: ['x'] }]);
    expect(withCourse(hidden, 'a', 'x')).toEqual(plan);
  });

  it('hides a course in the timetables which contain it', () => {
    const plan = {
      name: 'P',
      sources: [{ id: 'a' }, { id: 'b', only: ['x', 'y'] }, { id: 'c' }],
    };
    expect(withoutCourse(plan, 'y', ['a', 'b']).sources).toEqual([
      { id: 'a', except: ['y'] },
      { id: 'b', only: ['x'] },
      { id: 'c' },
    ]);
  });

  it('drops a timetable when its last selected course is hidden', () => {
    const plan = {
      name: 'P',
      sources: [
        { id: 'a', only: ['x'] },
        { id: 'b', only: ['y'] },
      ],
    };
    expect(withoutCourse(plan, 'x', ['a']).sources).toEqual([
      { id: 'b', only: ['y'] },
    ]);
  });
});
