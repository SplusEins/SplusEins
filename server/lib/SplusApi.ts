import * as request from 'request-promise-native';
import * as cacheManager from 'cache-manager';
import * as fsStore from 'cache-manager-fs-hash';

import { SplusParser } from './SplusParser';
import { RichLecture } from '../../model/RichLecture';

const PLAN_BASE = 'http://splus.ostfalia.de/semesterplan123.php';
const SET_BASE = 'http://splus.ostfalia.de/studentensetplan123.php';

// default must be in /tmp because the rest is RO on AWS Lambda
const CACHE_PATH = process.env.CACHE_PATH || '/tmp/spluseins-cache';
const CACHE_DISABLE = !!process.env.CACHE_DISABLE;
const CACHE_SECONDS = 600;

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

function splusPlanRequest(identifier: string, weekOfYear: number): PromiseLike<string> {
  return request({
    method: 'POST',
    uri: PLAN_BASE,
    qs: {
      semester: 'ss', // TODO change this in WS19/20
      identifier,
    },
    formData: {
      weeks: weekOfYear.toString(),
    },
  });
}

function splusSetRequest(identifier: string, weekOfYear: number): PromiseLike<string> {
  return request({
    method: 'POST',
    uri: SET_BASE,
    qs: {
      semester: 'ss', // TODO change this in WS19/20
    },
    formData: {
      'identifier[]': identifier,
      weeks: weekOfYear.toString(),
    },
  });
}

export default function getLectures(identifier: string, weekOfYear: number, isSet: boolean) {
  const key = `splus-${identifier}-${weekOfYear}`;

  return cache.wrap(key, async () => {
    console.log(`timetable cache miss for key ${key}`);
    const id = '#' + identifier;
    const data = isSet? await splusSetRequest(id, weekOfYear) : await splusPlanRequest(id, weekOfYear);
    const lectures = new SplusParser(data).getLectures();
    return lectures.map((lecture) => new RichLecture(lecture, weekOfYear));
  }, { ttl: CACHE_SECONDS }) as Promise<RichLecture[]>;
}
