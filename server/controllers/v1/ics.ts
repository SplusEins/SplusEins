import * as moment from 'moment';
import * as express from 'express';
import * as ical from 'ical-generator';
import { createHash } from 'crypto';

import * as TIMETABLES from '../../../assets/timetables.json';
import { RichLecture } from '../../model/v1/RichLecture';
import { Timetable, getLecturesForTimetablesAndWeeks } from '../../lib/v1/SplusApi';

const router = express.Router();

const sha256 = (x) => createHash('sha256').update(x, 'utf8').digest('hex');
const range = (lower: number, upper: number) => Array.from(Array(upper - lower), (x, i) => lower + i);

const ICS_PRELOAD_WEEKS = parseInt(process.env.ICS_PRELOAD_WEEKS || '4');
const CACHE_SECONDS = parseInt(process.env.ICS_CACHE_SECONDS || '600');

/**
 * @param lecture lecture
 * @returns ical event
 */
function lectureToEvent(lecture: RichLecture) {
  const uid = sha256(JSON.stringify(lecture)).substr(0, 16);
  return {
    uid,
    start: moment(lecture.start).add(lecture.begin, 'hours').toDate(),
    end: moment(lecture.start).add(lecture.begin + lecture.duration, 'hours').toDate(),
    timestamp: moment().toDate(),
    summary: lecture.title,
    description: lecture.lecturer + (lecture.info != '' ? ' - ' : '') + lecture.info,
    location: lecture.room,
  };
}

/**
 * Get all lectures for the given timetables in the
 * upcoming weeks, then filter for the given titles.
 *
 * @param version Reserved for later use, should be 'v1'
 * @param timetables Comma-separated list of timetable IDs
 * @param lectures Comma-separated list of lecture title IDs
 * @return An ICS calendar
 */
router.get('/:version/:timetables/:lectures?', async (req, res, next) => {
  const timetableIds = <string[]>req.params.timetables.split(',');
  const titleIds = <string[]>(req.params.lectures || '')
    .split(',')
    .filter((titleId) => titleId.length > 0);

  const timetables = timetableIds
    .map((timetableId) => (<Timetable[]>TIMETABLES).find(({ id }) => id == timetableId))
    .filter((timetable) => timetable != undefined);

  if (timetables.length == 0) {
    res.set('Cache-Control', `public, max-age=${CACHE_SECONDS}`);
    res.sendStatus(404);
    return;
  }

  const thisWeek = moment().week();
  const weeks = range(thisWeek, thisWeek + ICS_PRELOAD_WEEKS);

  try {
    const allLectures = await getLecturesForTimetablesAndWeeks(timetables, weeks);
    const lectures = titleIds.length > 0 ?
      allLectures.filter(({ titleId }) => titleIds.includes(titleId))
      : allLectures;
    const events = lectures.map(lectureToEvent);

    const cal = ical({ domain: 'spluseins.de', events, timezone: 'Europe/Berlin' });

    res.set('Content-Type', 'text/plain');
    res.set('Content-Disposition', 'attachment;filename="spluseins.ics"');
    res.set('Cache-Control', `public, max-age=${CACHE_SECONDS}`);
    res.send(cal.toString());
  } catch (error) {
    next(error);
  }
});

export default router;
