import fetch from 'node-fetch';
import * as cacheManager from 'cache-manager';
import * as fsStore from 'cache-manager-fs-hash';

import { SplusParser } from './SplusParser';
import { Event, TimetableRequest } from '../../model/v2/SplusEinsModel';
import { URL, URLSearchParams } from 'url';

const PLAN_BASE = 'http://splus.ostfalia.de/semesterplan123.php';
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

const sessionKeyAlphabet = '0123456789abcdefghijklmnopqrstuvwxyz';

/**
 * Return a 26 character long random session ID, prefixed by 'spluseins-'.
 * @see https://www.php.net/manual/en/function.session-create-id.php
 */
function createSessionId() {
  let key = '';
  for (let n = 0; n <= 16; n++) {
    const pos = Math.floor(Math.random() * sessionKeyAlphabet.length);
    key += sessionKeyAlphabet.charAt(pos);
  }
  return `spluseins-${key}`;
}

/**
 * Fetch standard timetable from splus.ostfalia.de
 *
 * @param timetable request
 * @returns HTML-string
 */
function splusPlanRequest(timetable: TimetableRequest): Promise<string> {
  const url = new URL(PLAN_BASE);
  url.searchParams.append('semester', 'ss'); // TODO change this in WS19/20
  url.searchParams.append('identifier', timetable.id);
  const body = new URLSearchParams();
  body.append('weeks', timetable.week.toString());
  const sessionId = createSessionId();

  return fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Cookie': `PHPSESSID=${sessionId}`,
    },
    body,
  }).then((res) => res.text());
}


/**
 * Fetch set-timetable from splus.ostfalia.de
 *
 * @param timetable request
 * @returns HTML-string
 */
function splusSetRequest(timetable: TimetableRequest): Promise<string> {
  const url = new URL(SET_BASE);
  url.searchParams.append('semester', 'ss'); // TODO change this in WS19/20
  const body = new URLSearchParams();
  body.append('weeks', timetable.week.toString());
  body.append('identifier[]', timetable.id);
  const sessionId = createSessionId();

  return fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Cookie': `PHPSESSID=${sessionId}`,
    },
    body,
  }).then((res) => res.text());
}

/**
 * Parses HTML to Events
 *
 * @param timetable request
 * @returns parsed Events
 */
function parseTimetable(timetable: TimetableRequest): Promise<Event[]> {
  const key = `splus-${timetable.id}-${timetable.week}-v2`;

  return cache.wrap(key, async () => {
    console.log(`timetable cache miss for key ${key}`);
    timetable.id = '#' + timetable.id;
    const data = timetable.setplan? await splusSetRequest(timetable) : await splusPlanRequest(timetable);
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
export default function getEvents(timetables: TimetableRequest[]): Promise<Event[]> {
  return Promise.all(timetables.map((timetable: TimetableRequest) => parseTimetable(timetable)))
    .then(flatten);
}
