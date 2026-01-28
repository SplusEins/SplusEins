export const uniq = (iterable) => [...new Set(iterable)];
export const flatten = (iterable) => [].concat(...iterable);
export const scalarArraysEqual = (array1, array2) =>
  array1.length === array2.length &&
  array1.every((value, index) => value === array2[index]);
export const range = (lower, upper) =>
  Array.from(Array(upper - lower), (x, i) => lower + i);

export const SEMESTER_WEEK_1 = 10; // TODO Semesterwechsel set to first calendar week of the semester

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

export function timetableToRoute(timetable) {
  return {
    name: 'plan-timetable',
    params: { timetable: timetable.id },
  };
}

export function shortenTimetableDegree(timetable) {
  let shortenedDegree;

  switch (timetable.degree) {
    case 'Bachelor of Science':
      shortenedDegree = 'B.Sc.';
      break;
    case 'Master of Science':
      shortenedDegree = 'M.Sc.';
      break;
    case 'Bachelor of Arts':
      shortenedDegree = 'B.A.';
      break;
    case 'Master of Arts':
      shortenedDegree = 'M.A.';
      break;
    case 'Bachelor of Engineering':
      shortenedDegree = 'B.Eng.';
      break;
    case 'Master of Engineering':
      shortenedDegree = 'M.Eng.';
      break;
    case 'Bachelor of Laws':
      shortenedDegree = 'LL.B.';
      break;
    case 'Master of Laws':
      shortenedDegree = 'LL.M.';
      break;
    default:
      shortenedDegree = timetable.degree;
  }

  return shortenedDegree;
}
