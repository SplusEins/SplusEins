import * as express from 'express';
import * as cors from 'cors';
import * as TIMETABLES from '../../assets/timetables.json';

import getLectures from '../lib/SplusApi';
import { TimetableRequest } from '../model/SplusEinsModel'

const CACHE_SECONDS = parseInt(process.env.SPLUS_CACHE_SECONDS || '10800');

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
  const requestedTimetable = TIMETABLES.find(({ id }) => id == timetableId);

  if (!requestedTimetable) {
    res.set('Cache-Control', `public, max-age=${CACHE_SECONDS}`);
    res.sendStatus(404);
    return;
  }

  const week = parseInt(req.params.week);

  try {
    const request: TimetableRequest = <TimetableRequest> {id: requestedTimetable.id, week: week, setplan: requestedTimetable.setplan};
    const data = await getLectures(request);

    res.set('Cache-Control', `public, max-age=${CACHE_SECONDS}`);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
