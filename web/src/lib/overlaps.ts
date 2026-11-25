import type { Event } from '../types';

interface TimeSpan {
  start: string;
  end: string;
}

const time = (date: string) => new Date(date).getTime();

/**
 * @param a lecture with `start` and `end` dates
 * @param b another lecture
 * @returns true if the two lectures take place at the same time
 */
export function overlaps(a: TimeSpan, b: TimeSpan): boolean {
  return time(a.start) < time(b.end) && time(b.start) < time(a.end);
}

/**
 * @param lectures all lectures (events of the API)
 * @param selectedIds ids of the courses the user selected
 * @returns for each selected course which takes place at the same time as
 * another selected course, the title of that other course: { id: title }
 */
export function overlappingCourses(
  lectures: Event[],
  selectedIds: string[],
): Map<string, string> {
  const selected = new Set(selectedIds);
  const chosen = lectures.filter((lecture) => selected.has(lecture.id));
  const result = new Map<string, string>();
  chosen.forEach((lecture) => {
    // a course in two timetables is not compared with itself
    const other = chosen.find(
      (other) => other.id !== lecture.id && overlaps(lecture, other),
    );
    if (other && !result.has(lecture.id)) result.set(lecture.id, other.title);
  });
  return result;
}
