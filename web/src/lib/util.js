export const uniq = (iterable) => [...new Set(iterable)];
export const scalarArraysEqual = (array1, array2) =>
  array1.length === array2.length &&
  array1.every((value, index) => value === array2[index]);
export const range = (lower, upper) =>
  Array.from(Array(upper - lower), (x, i) => lower + i);

/**
 * `count` colors evenly spread between two hex colors, e.g. '#1976D2'.
 */
export function colorScale(from, to, count) {
  const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const [a, b] = [rgb(from), rgb(to)];
  return Array.from({ length: count }, (_, i) => {
    const t = count > 1 ? i / (count - 1) : 0.5;
    const mixed = a.map((c, j) => Math.round(c + (b[j] - c) * t));
    return '#' + mixed.map((c) => c.toString(16).padStart(2, '0')).join('');
  });
}

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

export function deepEqual(x, y) {
  if (typeof x === 'object' && typeof x === typeof y) {
    return (
      Object.keys(x).length === Object.keys(y).length &&
      Object.keys(x).every((key) => deepEqual(x[key], y[key]))
    );
  }

  return x === y;
}

function timetableSemesterSuffix(semester) {
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
  const suffix = timetableSemesterSuffix(timetable.semester);
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
