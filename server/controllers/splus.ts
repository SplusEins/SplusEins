import * as express from 'express';
import * as cors from 'cors';
import * as TIMETABLES from '../../assets/timetables.ws.json'; // TODO change this in SS20

import { TimetableRequest, TimetableMetadata, Timetable } from '../model/SplusEinsModel';
import getEvents from '../lib/SplusApi';

const CACHE_SECONDS = parseInt(process.env.SPLUS_CACHE_SECONDS || '10800');

const router = express.Router();
const flatten = <T>(arr: T[][]) => [].concat(...arr) as T[];

const isRequestFromOstfalia = (req) =>
  (req.headers['x-forwarded-for'] || req.connection.remoteAddress).startsWith('141.41.');
export const skedGuard = (req, res) => {
  const twoWeeks = 14 * 24 * 60 * 60 * 1000;
  if (isRequestFromOstfalia(req)) {
    res.cookie('auth', Date.now() + twoWeeks,
      { maxAge: twoWeeks, httpOnly: true, signed: true });
    return true;
  }
  if ('auth' in req.signedCookies &&
      Date.now() < parseInt(req.signedCookies['auth'])) {
    return true;
  }
  res.sendStatus(403);
  return false;
}

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

  if (timetable.sked && !skedGuard(req, res)) {
    return;
  }

  try {
    const requests = weeks.map((week) => (<TimetableRequest> {
      id: timetable.id,
      week: week,
      setplan: timetable.setplan,
      raumplan: timetable.raumplan,
      sked: timetable.sked,
    }) );
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

  if (timetables.some(timetable => timetable.sked) && !skedGuard(req, res)) {
    return;
  }

  const name = req.params.name;

  try {
    const requests = <TimetableRequest[]>flatten(timetables.map((timetable) => weeks.map((week) => (<TimetableRequest> {
      id: timetable.id,
      week: week,
      setplan: timetable.setplan,
      raumplan: timetable.raumplan,
      sked: timetable.sked,
    }) )));
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
