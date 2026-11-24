import express from 'express';
import ical from 'ical-generator';
import { createHash } from 'crypto';

import { config } from '../config';
import { upcomingIsoWeeks } from '../lib/dayjs';
import { Event } from '../model/SplusEinsModel';
import { getEvents } from '../lib/SplusApi';
import { roomsToText } from '../lib/Room/RoomLocationApi';
import { findTimetables, splitList } from '../lib/timetables';

const router = express.Router();
const sha256 = (x: string) =>
  createHash('sha256').update(x, 'utf8').digest('hex');
const CACHE_SECONDS = config.icsCacheSeconds;

/**
 * @param lecture lecture
 * @returns ical event
 */
function eventToICSEvent(lecture: Event) {
  // the uid must not change with the room data
  const stable = { ...lecture, rooms: undefined };
  const uid = sha256(JSON.stringify(stable)).slice(0, 16);
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
    location: roomsToText(lecture.rooms),
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
  const timetables = findTimetables(req.params.timetables);

  if (timetables.length === 0) {
    res.set('Cache-Control', `public, max-age=${CACHE_SECONDS}`);
    res.sendStatus(404);
    return;
  }

  // the timetables cover one semester, so a week number is never ambiguous
  const weeks = upcomingIsoWeeks(config.icsPreloadWeeks);

  try {
    const events = await getEvents(
      timetables,
      weeks,
      splitList(req.params.lectures),
    );
    const cal = ical({ events: events.map(eventToICSEvent) });

    res.set('Content-Type', 'text/plain');
    res.set('Content-Disposition', 'attachment;filename="spluseins.ics"');
    res.set('Cache-Control', `public, max-age=${CACHE_SECONDS}`);
    res.send(cal.toString());
  } catch (error) {
    next(error);
  }
});

export default router;
