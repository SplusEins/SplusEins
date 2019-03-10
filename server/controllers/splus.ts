import * as express from 'express';
import * as cors from 'cors';
import * as TIMETABLES from '../../assets/timetables.json';

import getLectures from '../lib/SplusApi';

const SPLUS_CACHE_SECONDS = parseInt(process.env.SPLUS_CACHE_SECONDS || '600');

const router = express.Router();

/**
 * Accept CORS preflight requests.
 */
router.options('/:timetable/:week', cors());

/**
 * Get all lectures for the given timetable and week.
 *
 * @param timetable The splus "identifier" query param without "#" prefix.
 * @param week The splus "week" request param. ISO week of year below 52 or week of next year above 52.
 * @return RichLecture[]
 */
router.get('/:timetable/:week', cors(), async (req, res, next) => {
  const timetableId = req.params.timetable;
  const timetable = TIMETABLES.find(({ id }) => id == timetableId);
  if (!timetable) {
    res.set('Cache-Control', `public, max-age=${SPLUS_CACHE_SECONDS}`);
    res.sendStatus(404);
    return;
  }

  const week = parseInt(req.params.week);

  try {
    const data = await getLectures(timetable, week);
    res.set('Cache-Control', `public, max-age=${SPLUS_CACHE_SECONDS}`);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
