import dayjs from './dayjs';

export const uniq = (iterable) => [...new Set(iterable)];

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

const SHORT_DEGREES = {
  'Bachelor of Science': 'B.Sc.',
  'Master of Science': 'M.Sc.',
  'Bachelor of Arts': 'B.A.',
  'Master of Arts': 'M.A.',
  'Bachelor of Engineering': 'B.Eng.',
  'Master of Engineering': 'M.Eng.',
  'Bachelor of Laws': 'LL.B.',
  'Master of Laws': 'LL.M.',
};

export function shortenTimetableDegree(timetable) {
  return SHORT_DEGREES[timetable.degree] ?? timetable.degree;
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
