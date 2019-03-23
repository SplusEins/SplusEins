import fetch from 'node-fetch';
import * as cacheManager from 'cache-manager';
import * as fsStore from 'cache-manager-fs-hash';

import { SplusParser } from './SplusParser';
import { Event, TimetableRequest } from '../model/SplusEinsModel';
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


function splusPlanRequest(timetable: TimetableRequest): Promise<string> {
  const url = new URL(PLAN_BASE);
  url.searchParams.append('semester', 'ss'); // TODO change this in WS19/20
  url.searchParams.append('identifier', timetable.id);
  const body = new URLSearchParams();
  body.append('weeks', timetable.week.toString());

  return fetch(url.toString(), {
    method: 'POST',
    body,
  }).then((res) => res.text());
}

function splusSetRequest(timetable: TimetableRequest): Promise<string> {
  const url = new URL(SET_BASE);
  url.searchParams.append('semester', 'ss'); // TODO change this in WS19/20
  const body = new URLSearchParams();
  body.append('weeks', timetable.week.toString());
  body.append('identifier[]', timetable.id);

  return fetch(url.toString(), {
    method: 'POST',
    body,
  }).then((res) => res.text());
}

export default function getLectures(timetable: TimetableRequest) {
  const key = `splus-${timetable.id}-${timetable.week}`;

  return cache.wrap(key, async () => {
    console.log(`timetable cache miss for key ${key}`);
    timetable.id = '#' + timetable.id;
    const data = timetable.setplan? await splusSetRequest(timetable) : await splusPlanRequest(timetable);
    const lectures = new SplusParser(data).getLectures(timetable.week);
    return lectures.map((lecture) => new Event(lecture));
  }, { ttl: CACHE_SECONDS }) as Promise<Event[]>;
}

export function getLecturesForTimetablesAndWeeks(timetables: TimetableRequest[]) {
  return Promise.all(timetables.map((timetable: TimetableRequest) => getLectures(timetable)))
    .then(flatten);
}
