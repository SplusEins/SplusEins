// Date library, see https://day.js.org/
// Always import dayjs from this file so that the plugins are available.
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isoWeek from 'dayjs/plugin/isoWeek';
import 'dayjs/locale/de';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(isoWeek);
// the timetables contain german month names
dayjs.locale('de');

export default dayjs;

/**
 * ISO week numbers of this week and the following weeks, e.g. [52, 53, 1, 2]
 * at the end of a year with 53 weeks.
 */
export function upcomingIsoWeeks(count: number, from = dayjs()): number[] {
  return Array.from({ length: count }, (_, i) => from.add(i, 'week').isoWeek());
}
