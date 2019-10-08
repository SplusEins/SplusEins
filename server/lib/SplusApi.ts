import fetch from 'node-fetch';
import * as cacheManager from 'cache-manager';
import * as fsStore from 'cache-manager-fs-hash';

import { SplusParser } from './SplusParser';
import { Event, TimetableRequest } from '../model/SplusEinsModel';
import { URL, URLSearchParams } from 'url';

const PLAN_BASE = 'http://splus.ostfalia.de/semesterplan123.php';
const RAUMPLAN_BASE = 'http://splus.ostfalia.de/raumplan123.php';
const SET_BASE = 'http://splus.ostfalia.de/studentensetplan123.php';

const flatten = <T>(arr: T[][]) => [].concat(...arr) as T[];

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
 * Synchronize a function.
 */
let locked = false;
async function synchronize<T>(fun: () => Promise<T>) {
  while (locked) {
    await sleep(0);
  }
  locked = true;
  const result = await fun();
  locked = false;
  return result;
}

/**
 * Fetch standard timetable from splus.ostfalia.de
 *
 * @param timetable request
 * @returns HTML-string
 */
function splusPlanRequest(timetable: TimetableRequest): Promise<string> {
  const url = new URL(PLAN_BASE);
  url.searchParams.append('semester', 'ws'); // TODO change this in SS20
  url.searchParams.append('identifier', timetable.id);
  const body = new URLSearchParams();
  body.append('weeks', timetable.week.toString());

  return synchronize(() => fetch(url.toString(), {
    method: 'POST',
    body,
  })).then((res) => res.text());
}


/**
 * Fetch set-timetable from splus.ostfalia.de
 *
 * @param timetable request
 * @returns HTML-string
 */
function splusSetRequest(timetable: TimetableRequest): Promise<string> {
  const url = new URL(SET_BASE);
  url.searchParams.append('semester', 'ws'); // TODO change this in SS 20
  const body = new URLSearchParams();
  body.append('weeks', timetable.week.toString());
  body.append('identifier[]', timetable.id);

  return synchronize(() => fetch(url.toString(), {
    method: 'POST',
    body,
  })).then((res) => res.text());
}

/**
 * Fetch Raumplan-timetable from splus.ostfalia.de
 *
 * @param timetable request
 * @returns HTML-string
 */
function splusRaumplanRequest(timetable: TimetableRequest): Promise<string> {
  const url = new URL(RAUMPLAN_BASE);
  url.searchParams.append('semester', 'ws'); // TODO change this in SS20
  url.searchParams.append('identifier', timetable.id);
  const body = new URLSearchParams();
  body.append('weeks', timetable.week.toString());

  return synchronize(() => fetch(url.toString(), {
    method: 'POST',
    body,
  })).then((res) => res.text());
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
    timetable.id = '#' + timetable.id;
    let data;
    if (timetable.setplan) {
      data = await splusSetRequest(timetable);
    }
    if (timetable.raumplan) {
      data = await splusRaumplanRequest(timetable);
    }
    if (!timetable.setplan && !timetable.raumplan) {
      data = await splusPlanRequest(timetable);
    }
    const lectures = new SplusParser(data).getLectures(timetable.week);
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
