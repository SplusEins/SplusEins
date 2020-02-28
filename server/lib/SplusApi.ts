import fetch, { Headers } from 'node-fetch';
import * as cacheManager from 'cache-manager';
import * as fsStore from 'cache-manager-fs-hash';
import { Event, TimetableRequest } from '../model/SplusEinsModel';
import { parseSkedGraphical, parseSkedList } from './SkedParser';

const SKED_BASE = 'https://stundenplan.ostfalia.de/';

const flatten = <T>(arr: T[][]) => [].concat(...arr) as T[];

const SKED_USER = process.env.SKED_USER;
const SKED_PASSWORD = process.env.SKED_PASSWORD;

// default must be in /tmp because the rest is RO on AWS Lambda
const CACHE_PATH = process.env.CACHE_PATH || '/tmp/spluseins-cache';
const CACHE_DISABLE = !!process.env.CACHE_DISABLE;
const CACHE_SECONDS = parseInt(process.env.SPLUS_CACHE_SECONDS || '10800');

const cache = CACHE_DISABLE ?
  cacheManager.caching({ store: 'memory', max: 0 }) :
  cacheManager.caching({
    store: fsStore,
    options: {
      path: CACHE_PATH,
      ttl: 60,
      subdirs: true,
    },
  });


/**
 * Fetch sked-timetable from stundenplan.ostfalia.de
 * @param timetable request
 * @returns HTML-string
 */
function skedRequest(timetable: TimetableRequest): Promise<string> {
  const token = Buffer.from(SKED_USER + ':' + SKED_PASSWORD).toString('base64');
  const headers = new Headers();
  headers.append('Authorization', 'Basic ' + token);

  const url = SKED_BASE + timetable.skedPath;
  return fetch(url, { headers }).then((res) => res.text());
}

/**
 * Parses HTML to Events
 *
 * @param timetable request
 * @returns parsed Events
 */
function parseTimetable(timetable: TimetableRequest): Promise<Event[]> {
  const key = `splus-${timetable.id}-${timetable.week}`;

  return cache.wrap(key, async () => {
    console.log(`timetable cache miss for key ${key}`);

    const data = await skedRequest(timetable);
    const lectures = timetable.graphical ?
      parseSkedGraphical(data, timetable.week) :
      parseSkedList(data, timetable.week);

    console.log(`saving ${lectures.length} lectures for ${key}`)
    return lectures.map((lecture) => new Event(lecture));
  }, { ttl: CACHE_SECONDS }) as Promise<Event[]>;
}

/**
 * Manages multiple TimetableRequests
 *
 * @param timetables request
 * @returns requested Events
 */
export default async function getEvents(timetables: TimetableRequest[]): Promise<Event[]> {
  const allEvents = await Promise.all(timetables.map((timetable: TimetableRequest) => parseTimetable(timetable)))
    .then(flatten);

  // filter duplicates
  const key = (event: Event) =>
    `${event.meta.organiserShortname} ${event.id} ${event.location} ` +
    `${event.start} ${event.end}`;
  const eventsByKey = new Map<string, Event>();
  allEvents.forEach((event) => eventsByKey.set(key(event), event));
  const events = [...eventsByKey.values()];

  return events;
}
