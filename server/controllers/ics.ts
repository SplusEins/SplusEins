import * as moment from 'moment';
import * as express from 'express';
import * as ical from 'ical-generator';
import { createHash } from 'crypto';

import * as TIMETABLES from '../assets/timetables.json'; // TODO change this in WS20
import { Event, TimetableRequest } from '../model/SplusEinsModel';
import getEvents from '../lib/SplusApi';
import { skedGuard } from './splus';

const router = express.Router();
const sha256 = (x) => createHash('sha256').update(x, 'utf8').digest('hex');
const range = (lower: number, upper: number) => Array.from(Array(upper - lower), (x, i) => lower + i);

const ICS_PRELOAD_WEEKS = parseInt(process.env.ICS_PRELOAD_WEEKS || '4');
const CACHE_SECONDS = parseInt(process.env.ICS_CACHE_SECONDS || '600');


/**
 * @param lecture lecture
 * @returns ical event
 */
function eventToICSEvent(lecture: Event) {
  const uid = sha256(JSON.stringify(lecture)).substr(0, 16);
  return {
    uid,
    start: lecture.start,
    end: lecture.end,
    timestamp: moment().toDate(),
    summary: lecture.title,
    description: lecture.meta.organiserName + (lecture.meta.description != '' ? ' - ' : '') + lecture.meta.description,
    location: lecture.location,
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
    .map((timetableId) => TIMETABLES.find(({ id }) => id == timetableId))
    .filter((timetable) => timetable != undefined);

  if (timetables.length == 0) {
    res.set('Cache-Control', `public, max-age=${CACHE_SECONDS}`);
    res.sendStatus(404);
    return;
  }

  if (timetables.some(timetable => timetable.sked) && !skedGuard(req, res)) {
    return;
  }

  const thisWeek = moment().week();
  const weeks = range(thisWeek, thisWeek + ICS_PRELOAD_WEEKS);

  try {
    const requests: TimetableRequest[] = [];
    weeks.forEach((week) => timetables.forEach((timetable) => requests.push(<TimetableRequest>{
      id: timetable.id,
      week: week,
    })));

    const allEvents: Event[] = await getEvents(requests);
    const filteredEvents = titleIds.length > 0 ?
      allEvents.filter(({ id }) => titleIds.includes(id))
      : allEvents;
    const events = filteredEvents.map((event) => eventToICSEvent(event));

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
