import type { Dayjs } from 'dayjs';
import dayjs from './dayjs';
import type {
  AnyTimetable,
  CustomTimetable,
  Plan,
  TimetableEntry,
} from '../types';

export const uniq = <T>(iterable: Iterable<T>): T[] => [...new Set(iterable)];

export const SEMESTER_WEEK_1 = 39; // TODO Semesterwechsel set to first calendar week of the semester

export function isCustomTimetable(
  timetable: AnyTimetable | undefined,
): timetable is CustomTimetable {
  return !!timetable && 'whitelist' in timetable && !!timetable.whitelist;
}

export function customTimetableToRoute(customTimetable: CustomTimetable) {
  const query = {
    id: customTimetable.id,
    course: customTimetable.whitelist,
    name: customTimetable.label,
    v: '1',
  };

  return { name: 'plan-timetable', params: {}, query };
}

export function timetablePlan(timetable: AnyTimetable): Plan {
  return isCustomTimetable(timetable)
    ? { name: timetable.label, route: customTimetableToRoute(timetable) }
    : {
        name: timetableDisplayName(timetable),
        route: { name: 'plan-timetable', params: { timetable: timetable.id } },
      };
}

/**
 * @returns e.g. '3. Sem.', or '' for semesters like 'WPF' or 'Sonstige',
 * whose timetable labels already say what they contain
 */
export function semesterLabel(semester: number | string): string {
  return typeof semester === 'number' ? `${semester}. Sem.` : '';
}

export function courseCount(count: number): string {
  return count === 1 ? '1 Kurs' : `${count} Kurse`;
}

export function truncateText(text: string, maxLength: number): string {
  return text.length > maxLength
    ? `${text.slice(0, maxLength).trimEnd()}…`
    : text;
}

// e.g. "Digital Technologies 1. Sem."; maxLabelLength truncates the label only, so the suffix survives
export function timetableDisplayName(
  timetable: TimetableEntry,
  maxLabelLength = Infinity,
): string {
  const label = truncateText(timetable.label, maxLabelLength);
  const suffix = semesterLabel(timetable.semester);
  return suffix ? `${label} ${suffix}` : label;
}

// semester ("3. Semester" or "WPF"), faculty and degree
export function timetableSubtitle(timetable: TimetableEntry): string {
  const semester =
    typeof timetable.semester === 'number'
      ? `${timetable.semester}. Semester`
      : timetable.semester;
  return `${semester} · ${timetable.faculty} ${timetable.degree}`;
}

export function relativeDay(
  date: Dayjs,
  now: number,
): 'Heute' | 'Morgen' | undefined {
  const today = dayjs(now);
  if (date.isSame(today, 'day')) return 'Heute';
  if (date.isSame(today.add(1, 'day'), 'day')) return 'Morgen';
  return undefined;
}
