import * as moment from 'moment';
import * as express from 'express';
import * as cacheManager from 'cache-manager';
import * as fsStore from 'cache-manager-fs-hash';
import * as ical from 'ical-generator';
import { createHash } from 'crypto';

import * as TIMETABLES from '../../assets/timetables.json';
import { RichLecture } from '../../model/RichLecture';
import { SplusApi } from '../lib/SplusApi';

const router = express.Router();

const sha256 = (x) => createHash('sha256').update(x, 'utf8').digest('hex');
const flatten = <T>(arr: T[][]) => [].concat(...arr) as T[];
const range = (lower: number, upper: number) => Array.from(Array(upper - lower), (x, i) => lower + i);

interface Timetable {
  id: string;
  setplan: boolean;
}

const SCHEDULE_CACHE_SECONDS = 600;
const ICS_PRELOAD_WEEKS = parseInt(process.env.ICS_PRELOAD_WEEKS || '2');

// default must be in /tmp because the rest is RO on AWS Lambda
const CACHE_PATH = process.env.CACHE_PATH || '/tmp/spluseins-cache';
const CACHE_DISABLE = !!process.env.CACHE_DISABLE;

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

function lecturesForTimetableAndWeek(timetable: Timetable, week: number): Promise<RichLecture[]> {
  const key = `${timetable.id}-${week}`;

  return cache.wrap(key, async () => {
    console.log(`timetable cache miss for key ${key}`);
    const lectures = await SplusApi.getData('#' + timetable.id, week, timetable.setplan);
    return lectures.map((lecture) => new RichLecture(lecture, week));
  }, { ttl: SCHEDULE_CACHE_SECONDS });
}

function lecturesForTimetablesAndWeek(timetables: Timetable[], week: number) {
  return Promise.all(timetables.map((timetable) => lecturesForTimetableAndWeek(timetable, week)))
    .then(flatten);
}

function lecturesForTimetablesAndWeeks(timetables: Timetable[], weeks: number[]) {
  return Promise.all(weeks.map((week) => lecturesForTimetablesAndWeek(timetables, week)))
    .then(flatten);
}

function lectureToEvent(lecture: RichLecture) {
  const uid = sha256(JSON.stringify(lecture)).substr(0, 16);
  return {
    uid,
    start: moment(lecture.start).add(lecture.begin, 'hours').toDate(),
    end: moment(lecture.start).add(lecture.begin + lecture.duration, 'hours').toDate(),
    timestamp: moment().toDate(),
    summary: lecture.title,
    description: lecture.lecturer + (lecture.info != '' ? ' - ' : '') + lecture.info,
    location: lecture.room,
    timezone: 'Europe/Berlin',
  };
}

router.get('/:version/:timetables/:lectures', async (req, res, next) => {
  const timetableIds = <string[]>req.params.timetables.split(',');
  const titleIds = <string[]>req.params.lectures.split(',');

  const timetables = timetableIds
    .map((timetableId) => (<Timetable[]>TIMETABLES).find(({ id }) => id == timetableId))
    .filter((timetable) => timetable != undefined);

  const thisWeek = moment().week();
  const weeks = range(thisWeek, thisWeek + ICS_PRELOAD_WEEKS);

  const allLectures = await lecturesForTimetablesAndWeeks(timetables, weeks);
  const lectures = allLectures.filter(({ titleId }) => titleIds.includes(titleId));
  const events = lectures.map(lectureToEvent);

  const cal = ical({ domain: 'spluseins.de', events, timezone: 'Europe/Berlin' });

  res.set('Content-Type', 'text/plain');
  res.set('Cache-Control', `public, max-age=${SCHEDULE_CACHE_SECONDS}`);
  res.send(cal.toString());
});

export default router;
