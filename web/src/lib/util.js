import dayjs from './dayjs';

export const uniq = (iterable) => [...new Set(iterable)];

export const SEMESTER_WEEK_1 = 39; // TODO Semesterwechsel set to first calendar week of the semester

export function customTimetableToRoute(customTimetable) {
  const query = {
    id: customTimetable.id,
    course: customTimetable.whitelist,
    name: customTimetable.label,
    v: '1',
  };

  return { name: 'plan-timetable', params: {}, query };
}

export function timetablePlan(timetable) {
  return timetable.whitelist
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
export function semesterLabel(semester) {
  return typeof semester === 'number' ? `${semester}. Sem.` : '';
}

export function courseCount(count) {
  return count === 1 ? '1 Kurs' : `${count} Kurse`;
}

export function truncateText(text, maxLength) {
  return text.length > maxLength
    ? `${text.slice(0, maxLength).trimEnd()}…`
    : text;
}

// e.g. "Digital Technologies 1. Sem."; maxLabelLength truncates the label only, so the suffix survives
export function timetableDisplayName(timetable, maxLabelLength = Infinity) {
  const label = truncateText(timetable.label, maxLabelLength);
  const suffix = semesterLabel(timetable.semester);
  return suffix ? `${label} ${suffix}` : label;
}

// semester ("3. Semester" or "WPF"), faculty and degree
export function timetableSubtitle(timetable) {
  const semester =
    typeof timetable.semester === 'number'
      ? `${timetable.semester}. Semester`
      : timetable.semester;
  return `${semester} · ${timetable.faculty} ${timetable.degree}`;
}

/**
 * The API appends a map link to every room, e.g.
 * "A209 (Am Exer 2, 38302 Wolfenbüttel) Link: https://... / B107 Link: https://...".
 * @returns the rooms without the links, e.g. "A209 (Am Exer 2, 38302 Wolfenbüttel) / B107"
 */
export function roomWithoutLinks(room) {
  return (room || '').replace(/ Link: \S+/g, '');
}

export function relativeDay(date, now) {
  const today = dayjs(now);
  if (date.isSame(today, 'day')) return 'Heute';
  if (date.isSame(today.add(1, 'day'), 'day')) return 'Morgen';
  return undefined;
}
