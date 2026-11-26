// times like '08:00' compare correctly as text
const sameTime = (x, y) =>
  x.day === y.day && x.start < y.end && y.start < x.end;

/**
 * @param a lecture with `slots`, its weekly times
 * @param b another lecture
 * @returns true if the two lectures take place at the same time of the week
 */
export function overlaps(a, b) {
  return (a.slots ?? []).some((x) =>
    (b.slots ?? []).some((y) => sameTime(x, y)),
  );
}

/**
 * @param lectures all lectures (events of the API)
 * @param selectedIds ids of the courses the user selected
 * @returns for each selected course which takes place at the same time as
 * another selected course, the title of that other course: { id: title }
 */
export function overlappingCourses(lectures, selectedIds) {
  const selected = new Set(selectedIds);
  const chosen = lectures.filter((lecture) => selected.has(lecture.id));
  const result = new Map();
  chosen.forEach((lecture) => {
    // a course in two timetables is not compared with itself
    const other = chosen.find(
      (other) => other.id !== lecture.id && overlaps(lecture, other),
    );
    if (other && !result.has(lecture.id)) result.set(lecture.id, other.title);
  });
  return result;
}
