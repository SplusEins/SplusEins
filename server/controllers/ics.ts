import express from 'express';
import ical from 'ical-generator';
import { createHash } from 'crypto';

import { config } from '../config';
import { upcomingIsoWeeks } from '../lib/dayjs';
import { Event } from '../model/SplusEinsModel';
import { getEvents } from '../lib/SplusApi';
import { parseSources } from '../lib/timetables';

const router = express.Router();
const sha256 = (x: string) =>
  createHash('sha256').update(x, 'utf8').digest('hex');
const CACHE_SECONDS = config.icsCacheSeconds;

/**
 * @param lecture lecture
 * @returns ical event
 */
function eventToICSEvent(lecture: Event) {
  // the uid must not change when other timetables are added to the calendar
  const stable = { ...lecture, colorIndex: undefined, sources: undefined };
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
    location: lecture.location,
  };
}

/**
 * Get the events of the given timetables in the upcoming weeks
 *
 * @param version Reserved for later use, should be 'v1'
 * @param sources Timetables and courses like in GET /splus/:sources/:weeks
 * @return An ICS calendar
 */
router.get('/:version/:sources', async (req, res, next) => {
  const sources = parseSources(req.params.sources);

  if (sources.length === 0) {
    res.set('Cache-Control', `public, max-age=${CACHE_SECONDS}`);
    res.sendStatus(404);
    return;
  }

  // the timetables cover one semester, so a week number is never ambiguous
  const weeks = upcomingIsoWeeks(config.icsPreloadWeeks);

  try {
    const events = await getEvents(sources, weeks);
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
