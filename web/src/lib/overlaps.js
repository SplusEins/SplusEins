import dayjs from './dayjs';

/**
 * @param a lecture with `begin` and `duration` in hours
 * @param b another lecture
 * @returns true if the two lectures take place at the same time
 */
export function overlaps(a, b) {
  return a.begin < b.begin + b.duration && b.begin < a.begin + a.duration;
}

/**
 * @param lectures all lectures, see eventsAsLectures in stores/splus.js
 * @param selectedCourses courses the user selected (with a `titleId`)
 * @returns titles of the selected courses which take place at the same time
 */
export function overlappingCourseTitles(lectures, selectedCourses) {
  const selectedIds = new Set(selectedCourses.map(({ titleId }) => titleId));

  // a lecture can be in several timetables, keep it only once
  const key = (lecture) =>
    `${lecture.organiserShortname} ${lecture.titleId} ${lecture.room} ` +
    `${lecture.start} ${lecture.duration}`;
  const lecturesByKey = new Map();
  lectures
    .filter((lecture) => selectedIds.has(lecture.titleId))
    .forEach((lecture) => lecturesByKey.set(key(lecture), lecture));

  // only lectures on the same day can overlap
  const lecturesByDay = new Map();
  for (const lecture of lecturesByKey.values()) {
    const day = dayjs(lecture.start).format('YYYY-MM-DD');
    lecturesByDay.set(day, [...(lecturesByDay.get(day) ?? []), lecture]);
  }

  const titles = new Map();
  for (const lecturesOfDay of lecturesByDay.values()) {
    lecturesOfDay.forEach((lecture, index) => {
      if (
        lecturesOfDay.some(
          (other, i) => i !== index && overlaps(lecture, other),
        )
      ) {
        titles.set(lecture.titleId, lecture.title);
      }
    });
  }
  return [...titles.values()];
}
