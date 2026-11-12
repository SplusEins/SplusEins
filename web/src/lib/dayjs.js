// Date library, see https://day.js.org/
// Always import dayjs from this file so that the plugins are available.
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/de';

dayjs.extend(isoWeek);
dayjs.extend(relativeTime);
dayjs.locale('de');

export default dayjs;
