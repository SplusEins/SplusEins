import express from 'express';
import ical from 'ical-generator';
import { createHash } from 'crypto';

import TIMETABLES from '../assets/timetables.json';
import { config } from '../config';
import { upcomingIsoWeeks } from '../lib/dayjs';
import { Event, TimetableRequest } from '../model/SplusEinsModel';
import { getEvents } from '../lib/SplusApi';

const router = express.Router();
const sha256 = (x: string) =>
  createHash('sha256').update(x, 'utf8').digest('hex');
const CACHE_SECONDS = config.icsCacheSeconds;

/**
 * @param lecture lecture
 * @returns ical event
 */
function eventToICSEvent(lecture: Event) {
  const uid = sha256(JSON.stringify(lecture)).slice(0, 16);
  return {
    uid,
    start: lecture.start,
    end: lecture.end,
    timestamp: new Date(),
    summary: lecture.title,
    description:
      lecture.meta.organiserName +
      (lecture.meta.description !== '' ? ' - ' : '') +
      lecture.meta.description,
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
router.get('/:version/:timetables{/:lectures}', async (req, res, next) => {
  const timetableIds = <string[]>req.params.timetables.split(',');
  const titleIds = <string[]>(
    (req.params.lectures || '')
      .split(',')
      .filter((titleId) => titleId.length > 0)
  );

  const timetables = timetableIds
    .map((timetableId) => TIMETABLES.find(({ id }) => id === timetableId))
    .filter((timetable) => timetable !== undefined);

  if (timetables.length === 0) {
    res.set('Cache-Control', `public, max-age=${CACHE_SECONDS}`);
    res.sendStatus(404);
    return;
  }

  // the timetables cover one semester, so a week number is never ambiguous
  const weeks = upcomingIsoWeeks(config.icsPreloadWeeks);

  try {
    const requests: TimetableRequest[] = weeks.flatMap((week) =>
      timetables.map((timetable) => ({
        id: timetable.id,
        week,
        type: timetable.type,
        faculty: timetable.faculty,
        timetablePath: timetable.timetablePath,
      })),
    );

    const allEvents: Event[] = await getEvents(requests);
    const filteredEvents =
      titleIds.length > 0
        ? allEvents.filter(({ id }) => titleIds.includes(id))
        : allEvents;
    const events = filteredEvents.map((event) => eventToICSEvent(event));

    const cal = ical({ events });

    res.set('Content-Type', 'text/plain');
    res.set('Content-Disposition', 'attachment;filename="spluseins.ics"');
    res.set('Cache-Control', `public, max-age=${CACHE_SECONDS}`);
    res.send(cal.toString());
  } catch (error) {
    next(error);
  }
});

export default router;
