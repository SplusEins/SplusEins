import TIMETABLES from '../assets/timetables.json';

/**
 * @param csv comma-separated values from a URL, e.g. 'a,b,'
 * @returns the non-empty values, e.g. ['a', 'b']
 */
export function splitList(csv = ''): string[] {
  return csv.split(',').filter((value) => value.length > 0);
}

/**
 * @param idsCsv comma-separated timetable ids
 * @returns the known timetables of these ids
 */
export function findTimetables(idsCsv: string) {
  return splitList(idsCsv)
    .map((timetableId) => TIMETABLES.find(({ id }) => id === timetableId))
    .filter((timetable) => timetable !== undefined);
}
