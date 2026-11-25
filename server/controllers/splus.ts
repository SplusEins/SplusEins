import express from 'express';
import { config } from '../config';

import type { TimetableMetadata, Timetable } from '../model/api';
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
 * Get Timetable for given id and week
 *
 * @param timetable id
 * @param weeks Comma-separated list of weeks
 * @return Timetable
 */
router.get('/:timetable/:weeks', async (req, res, next) => {
  const [timetable] = findTimetables(req.params.timetable);
  const weeks = splitList(req.params.weeks).map((week) => parseInt(week));

  if (!timetable || weeks.length === 0) {
    res.set('Cache-Control', CACHE_CONTROL);
    res.status(404).send('Stundenplan existiert nicht');
    return;
  }

  try {
    const events = await getEvents([timetable], weeks);

    const meta: TimetableMetadata = {
      id: timetable.id,
      faculty: timetable.faculty,
      degree: timetable.degree,
      specialisation: timetable.label,
      semester: Number(timetable.semester),
    };
    const response: Timetable = {
      name:
        timetable.degree === 'Räume'
          ? `${timetable.semester} ${timetable.label}`
          : `${timetable.degree} ${timetable.label} - ${timetable.semester}. Semester`,
      events,
      meta,
    };

    res.set('Cache-Control', CACHE_CONTROL);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * Get Timetable with given name for given timetable Ids, week and event Ids
 *
 * @param timetables Comma-separated list of timetable IDs
 * @param weeks Comma-separated list of weeks.
 * @param lectures Comma-separated list of lecture title IDs
 * @param name Name of requested Timetable
 * @return Timetable
 */
router.get('/:timetables/:weeks{/:lectures}/:name', async (req, res, next) => {
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

    const meta: TimetableMetadata = {
      id: req.params.timetables.split(','),
      faculty: timetables.map((x) => x.faculty),
      degree: timetables.map((x) => x.degree),
      specialisation: timetables.map((x) => x.label),
      semester: timetables.map((x) => Number(x.semester)),
    };
    const response: Timetable = {
      name: decodeURIComponent(req.params.name),
      events,
      meta,
    };

    res.set('Cache-Control', CACHE_CONTROL);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
