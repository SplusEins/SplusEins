import express from 'express';
import { config } from '../config';

import { getEvents, getUniqueEvents } from '../lib/SplusApi';
import { findTimetables, splitList } from '../lib/timetables';

const CACHE_CONTROL = `public, max-age=${config.splusCacheSeconds}`;

const router = express.Router();

/**
 * Get unique lectures for given timetable id
 *
 * @param timetable id
 * @return Array of unique events
 */
router.get('/:timetable/lectures', async (req, res, next) => {
  const [timetable] = findTimetables(req.params.timetable);

  if (!timetable) {
    res.set('Cache-Control', CACHE_CONTROL);
    res.sendStatus(404);
    return;
  }

  try {
    const events = await getUniqueEvents(timetable);
    res.set('Cache-Control', CACHE_CONTROL);
    res.json(events);
  } catch (error) {
    next(error);
  }
});

/**
 * Get the events of one or more timetables in the given weeks
 *
 * @param timetables Comma-separated list of timetable IDs
 * @param weeks Comma-separated list of weeks
 * @param lectures Comma-separated list of lecture title IDs, all if omitted
 * @return Array of events
 */
router.get('/:timetables/:weeks{/:lectures}', async (req, res, next) => {
  const timetables = findTimetables(req.params.timetables);
  const weeks = splitList(req.params.weeks).map((week) => parseInt(week));

  if (timetables.length === 0 || weeks.length === 0) {
    res.set('Cache-Control', CACHE_CONTROL);
    res.status(404).send('Stundenplan existiert nicht');
    return;
  }

  try {
    const events = await getEvents(
      timetables,
      weeks,
      splitList(req.params.lectures),
    );
    res.set('Cache-Control', CACHE_CONTROL);
    res.json(events);
  } catch (error) {
    next(error);
  }
});

export default router;
