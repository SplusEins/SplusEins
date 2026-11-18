const time = (date) => new Date(date).getTime();

/**
 * @param a lecture with `start` and `end` dates
 * @param b another lecture
 * @returns true if the two lectures take place at the same time
 */
export function overlaps(a, b) {
  return time(a.start) < time(b.end) && time(b.start) < time(a.end);
}

/**
 * @param lectures all lectures (events of the API)
 * @param selectedCourses courses the user selected (with an `id`)
 * @returns titles of the selected courses which take place at the same time
 */
export function overlappingCourseTitles(lectures, selectedCourses) {
  const selectedIds = new Set(selectedCourses.map(({ id }) => id));

  // a lecture can be in several timetables, keep it only once
  const key = (lecture) =>
    `${lecture.meta.organiserShortname} ${lecture.id} ${lecture.location} ` +
    `${lecture.start} ${lecture.end}`;
  const lecturesByKey = new Map();
  lectures
    .filter((lecture) => selectedIds.has(lecture.id))
    .forEach((lecture) => lecturesByKey.set(key(lecture), lecture));

  const unique = [...lecturesByKey.values()];
  const titles = new Map();
  unique.forEach((lecture, index) => {
    if (unique.some((other, i) => i !== index && overlaps(lecture, other))) {
      titles.set(lecture.id, lecture.title);
    }
  });
  return [...titles.values()];
}
