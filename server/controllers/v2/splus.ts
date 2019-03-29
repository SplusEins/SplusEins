import * as express from 'express';
import * as cors from 'cors';
import * as TIMETABLES from '../../../assets/timetables.json';

import { TimetableRequest, TimetableMetadata, Timetable } from '../../model/v2/SplusEinsModel';
import getEvents from '../../lib/v2/SplusApi';

const CACHE_SECONDS = parseInt(process.env.SPLUS_CACHE_SECONDS || '10800');

const router = express.Router();

/**
 * Accept CORS preflight requests.
 */
router.options('/:timetable/:week', cors());
router.options('/:name/:timetables/:week/:lectures?', cors());

/**
 * Get Timetable for given splusId and week
 *
 * @param timetable The splus "identifier" query param without "#" prefix.
 * @param week The splus "week" request param. ISO week of year below 52 or week of next year above 52.
 * @return Timetable
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
    const events = await getEvents([ request ]);

    const meta : TimetableMetadata = <TimetableMetadata> {
      splusID: requestedTimetable.id,
      faculty: requestedTimetable.faculty,
      degree: requestedTimetable.degree,
      specialisation: requestedTimetable.label,
      semester: Number(requestedTimetable.semester)
    }
    const timetable: Timetable = <Timetable> {
      name: `${(requestedTimetable.degree)} ${requestedTimetable.label} - ${requestedTimetable.semester}. Semester`,
      events: events,
      meta: meta
    }

    res.set('Cache-Control', `public, max-age=${CACHE_SECONDS}`);
    res.json(timetable);
  } catch (error) {
    next(error);
  }
});


/**
 * Get Timetable with given name for given splusIds, week und lecture Ids
 *
 * @param timetables Comma-separated list of timetable IDs
 * @param week The splus "week" request param. ISO week of year below 52 or week of next year above 52.
 * @param lectures Comma-separated list of lecture title IDs
 * @param name Name of requested Timetable
 * @return Timetable
 */
router.get('/:timetables/:week/:lectures?/:name', async (req, res, next) => {

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

  const name = req.params.name;
  const week = parseInt(req.params.week);

  try {
    const requests: TimetableRequest[] = [];
    timetables.forEach((timetable) => requests.push( <TimetableRequest> {id: timetable.id, week: week, setplan: timetable.setplan}));

    const allEvents = await getEvents(requests);
    const filteredEvents = titleIds.length > 0 ?
      allEvents.filter(({ id }) => titleIds.includes(id))
      : allEvents;

    const meta: TimetableMetadata = <TimetableMetadata> {
      splusID: timetableIds,
      faculty: timetables.map((x) => x.faculty),
      degree: timetables.map((x) => x.degree),
      specialisation: timetables.map((x) => x.label),
      semester: timetables.map((x) => Number(x.semester))
    };

    const timetable: Timetable = <Timetable> {
      name: name,
      events: filteredEvents,
      meta: meta
    }

    res.set('Cache-Control', `public, max-age=${CACHE_SECONDS}`);
    res.json(timetable);
  } catch (error) {
    next(error);
  }
});

export default router;
