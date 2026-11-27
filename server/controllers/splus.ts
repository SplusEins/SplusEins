import express from 'express';
import { BROWSER_CACHE } from '../lib/browserCache';

import { getEvents, getUniqueEvents } from '../lib/SplusApi';
import { findTimetable, parseSources, splitList } from '../lib/timetables';

const router = express.Router();

/**
 * Get unique lectures for given timetable id
 *
 * @param timetable id
 * @return Array of unique events
 */
router.get('/:timetable/lectures', async (req, res, next) => {
  const timetable = findTimetable(req.params.timetable);

  if (!timetable) {
    res.set('Cache-Control', BROWSER_CACHE);
    res.sendStatus(404);
    return;
  }

  try {
    const events = await getUniqueEvents(timetable);
    res.set('Cache-Control', BROWSER_CACHE);
    res.json(events);
  } catch (error) {
    next(error);
  }
});

/**
 * Get the events of one or more timetables in the given weeks
 *
 * @param sources Comma-separated timetable ids, each optionally with
 * the courses to leave out ('id!a.b') or the only ones to show ('id:a.b')
 * @param weeks Comma-separated list of weeks
 * @return Array of events
 */
router.get('/:sources/:weeks', async (req, res, next) => {
  const sources = parseSources(req.params.sources);
  const weeks = splitList(req.params.weeks).map((week) => parseInt(week));

  if (sources.length === 0 || weeks.length === 0) {
    res.set('Cache-Control', BROWSER_CACHE);
    res.status(404).send('Stundenplan existiert nicht');
    return;
  }

  try {
    const events = await getEvents(sources, weeks);
    res.set('Cache-Control', BROWSER_CACHE);
    res.json(events);
  } catch (error) {
    next(error);
  }
});

export default router;
