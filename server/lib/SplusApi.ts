import fetch, { Headers } from 'node-fetch';
import * as cacheManager from 'cache-manager';
import * as fsStore from 'cache-manager-fs-hash';
import * as moment from 'moment';
import { Event, TimetableRequest } from '../model/SplusEinsModel';
import { ParsedLecture } from '../model/SplusModel';
import { parseSkedGraphical, parseSkedList } from './SkedParser';

const SKED_BASE = process.env.SKED_URL || 'https://stundenplan.ostfalia.de/';

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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch sked-timetable from stundenplan.ostfalia.de
 * @param timetable request
 * @returns HTML-string
 */
async function skedRequest(timetable: TimetableRequest): Promise<string> {
  const token = Buffer.from(SKED_USER + ':' + SKED_PASSWORD).toString('base64');
  const headers = new Headers();
  headers.append('Authorization', 'Basic ' + token);

  const url = SKED_BASE + timetable.skedPath;
  console.log(`Url for ${timetable.id} is ${url}`)
  let error;
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url, { headers });
    if (res.ok) {
      return res.text()
    }

    error = `Sked error for ${timetable.id}-${timetable.week}: ${res.statusText} (attempt ${attempt})`;
    console.error(error);
    await sleep(100);
  }

  throw new Error(error);
}

/**
 * Parses HTML to Events
 *
 * @param timetable request
 * @returns parsed Events
 */
async function parseTimetable(timetable: TimetableRequest): Promise<Event[]> {
  const key = `lectures-${timetable.id}`;

  let lectures: ParsedLecture[] = await cache.wrap(key, async () => {
    console.log(`Lectures cache miss for key ${key}`);
    const data = await skedRequest(timetable);
    const lectures = timetable.graphical ?
      parseSkedGraphical(data, timetable.faculty) :
      parseSkedList(data);
    console.log(`Storing ${lectures.length} parsed lectures for ${key} in cache`)
    return lectures;
  }, { ttl: CACHE_SECONDS });
  lectures = lectures.filter(lecture => moment(lecture.start).isoWeek() == timetable.week);
  console.log(`Serving ${lectures.length} lectures for ${timetable.id} in week ${timetable.week}`);
  return lectures.map((lecture) => new Event(lecture));
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
