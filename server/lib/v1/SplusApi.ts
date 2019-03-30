import fetch from 'node-fetch';
import * as cacheManager from 'cache-manager';
import * as fsStore from 'cache-manager-fs-hash';

import { RichLecture } from '../../model/v1/RichLecture';
import { SplusParser } from './SplusParser';
import { URL, URLSearchParams } from 'url';

const PLAN_BASE = 'http://splus.ostfalia.de/semesterplan123.php';
const SET_BASE = 'http://splus.ostfalia.de/studentensetplan123.php';

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

const flatten = <T>(arr: T[][]) => [].concat(...arr) as T[];
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

function splusPlanRequest(identifier: string, weekOfYear: number): Promise<string> {
  const url = new URL(PLAN_BASE);
  url.searchParams.append('semester', 'ss'); // TODO change this in WS19/20
  url.searchParams.append('identifier', identifier);
  const body = new URLSearchParams();
  body.append('weeks', weekOfYear.toString());
  const sessionId = createSessionId();

  return fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Cookie': `PHPSESSID=${sessionId}`,
    },
    body,
  }).then((res) => res.text());
}

function splusSetRequest(identifier: string, weekOfYear: number): Promise<string> {
  const url = new URL(SET_BASE);
  url.searchParams.append('semester', 'ss'); // TODO change this in WS19/20
  const body = new URLSearchParams();
  body.append('weeks', weekOfYear.toString());
  body.append('identifier[]', identifier);
  const sessionId = createSessionId();

  return fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Cookie': `PHPSESSID=${sessionId}`,
    },
    body,
  }).then((res) => res.text());
}

export interface Timetable {
  id: string;
  setplan?: boolean;
}

export default function getLectures(timetable: Timetable, weekOfYear: number) {
  const key = `splus-${timetable.id}-${weekOfYear}-v1`;

  return cache.wrap(key, async () => {
    console.log(`timetable cache miss for key ${key}`);
    const id = '#' + timetable.id;
    const data = timetable.setplan? await splusSetRequest(id, weekOfYear) : await splusPlanRequest(id, weekOfYear);
    const lectures = new SplusParser(data).getLectures();
    return lectures.map((lecture) => new RichLecture(lecture, weekOfYear));
  }, { ttl: CACHE_SECONDS }) as Promise<RichLecture[]>;
}

function lecturesForTimetablesAndWeek(timetables: Timetable[], week: number) {
  return Promise.all(timetables.map((timetable) => getLectures(timetable, week)))
    .then(flatten);
}

export function getLecturesForTimetablesAndWeeks(timetables: Timetable[], weeks: number[]) {
  return Promise.all(weeks.map((week) => lecturesForTimetablesAndWeek(timetables, week)))
    .then(flatten);
}
