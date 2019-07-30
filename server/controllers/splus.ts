import * as express from 'express';
import * as cors from 'cors';
import * as TIMETABLES from '../../assets/timetables.ws.json'; // TODO change this in SS20

import { TimetableRequest, TimetableMetadata, Timetable } from '../model/SplusEinsModel';
import getEvents from '../lib/SplusApi';

const flatten = <T>(arr: T[][]) => [].concat(...arr) as T[];

const CACHE_SECONDS = parseInt(process.env.SPLUS_CACHE_SECONDS || '10800');

const router = express.Router();

/**
 * Accept CORS preflight requests.
 */
router.options('/:timetable/:weeks', cors());
router.options('/:timetables/:weeks/:lectures?/:name', cors());

/**
 * Get Timetable for given splusId and week
 *
 * @param timetable The splus "identifier" query param without "#" prefix.
 * @param weeks Comma-separated list of the splus "week" request param. ISO week of year below 52 or week of next year above 52.
 * @return Timetable
 */
router.get('/:timetable/:weeks', cors(), async (req, res, next) => {
  const timetableId = req.params.timetable;
  const timetable = TIMETABLES.find(({ id }) => id == timetableId);

  const weeks = req.params.weeks
    .split(',')
    .filter((week) => week.length > 0)
    .map((week) => parseInt(week));

  if (!timetable || weeks.length == 0) {
    res.set('Cache-Control', `public, max-age=${CACHE_SECONDS}`);
    res.sendStatus(404);
    return;
  }

  try {
    const requests = weeks.map((week) => (<TimetableRequest> { id: timetable.id, week: week, setplan: timetable.setplan }) );
    const events = await getEvents(requests);

    const meta: TimetableMetadata = <TimetableMetadata> {
      splusID: timetable.id,
      faculty: timetable.faculty,
      degree: timetable.degree,
      specialisation: timetable.label,
      semester: Number(timetable.semester)
    };
    const response: Timetable = <Timetable> {
      name: `${(timetable.degree)} ${timetable.label} - ${timetable.semester}. Semester`,
      events: events,
      meta: meta,
    };

    res.set('Cache-Control', `public, max-age=${CACHE_SECONDS}`);
    res.json(response);
  } catch (error) {
    next(error);
  }
});


/**
 * Get Timetable with given name for given splusIds, week and event Ids
 *
 * @param timetables Comma-separated list of timetable IDs
 * @param weeks Comma-separated list of the splus "week" request param. ISO week of year below 52 or week of next year above 52.
 * @param lectures Comma-separated list of lecture title IDs
 * @param name Name of requested Timetable
 * @return Timetable
 */
router.get('/:timetables/:weeks/:lectures?/:name', cors(), async (req, res, next) => {
  const timetableIds = <string[]>req.params.timetables.split(',');
  const titleIds = <string[]>(req.params.lectures || '')
    .split(',')
    .filter((titleId) => titleId.length > 0);

  const timetables = timetableIds
    .map((timetableId) => TIMETABLES.find(({ id }) => id == timetableId))
    .filter((timetable) => timetable != undefined);

  const weeks = req.params.weeks
    .split(',')
    .filter((week) => week.length > 0)
    .map((week) => parseInt(week));

  if (timetables.length == 0 || weeks.length == 0) {
    res.set('Cache-Control', `public, max-age=${CACHE_SECONDS}`);
    res.sendStatus(404);
    return;
  }

  const name = req.params.name;

  try {
    const requests = <TimetableRequest[]> flatten(timetables.map((timetable) => weeks.map((week) => (<TimetableRequest> { id: timetable.id, week: week, setplan: timetable.setplan }) )));
    const allEvents = await getEvents(requests);
    const filteredEvents = titleIds.length > 0 ?
      allEvents.filter(({ id }) => titleIds.includes(id))
      : allEvents;

    const meta: TimetableMetadata = <TimetableMetadata> {
      splusID: timetableIds,
      faculty: timetables.map((x) => x.faculty),
      degree: timetables.map((x) => x.degree),
      specialisation: timetables.map((x) => x.label),
      semester: timetables.map((x) => Number(x.semester)),
    };

    const timetable: Timetable = <Timetable> {
      name: name,
      events: filteredEvents,
      meta: meta,
    };

    res.set('Cache-Control', `public, max-age=${CACHE_SECONDS}`);
    res.json(timetable);
  } catch (error) {
    next(error);
  }
});

export default router;
