import * as express from 'express';
import * as cors from 'cors';
import * as cacheManager from 'cache-manager';
import * as fsStore from 'cache-manager-fs-hash';
import * as moment from 'moment';

import { SplusApi } from '../lib/SplusApi';
import { ILecture } from '../lib/ILecture';

const SCHEDULE_CACHE_SECONDS = 600;

// default must be in /tmp because the rest is RO on AWS Lambda
const CACHE_PATH = process.env.CACHE_PATH || '/tmp/spluseins-cache';

const router = express.Router();
const cache = cacheManager.caching({
  store: fsStore,
  options: {
    path: CACHE_PATH,
    ttl: 60,
    subdirs: true,
  },
});

function lectureAndWeekToDate(lecture: ILecture, week: number): Date {
  return moment()
    .startOf('date')
    .isoWeek(week)
    .isoWeekday(lecture.day + 1)
    .toDate();
}

/**
 * Accept CORS preflight requests.
 */
router.options('/:schedule/:week', cors());

/**
 * Get all lectures for the given schedule and week.
 *
 * @param schedule The splus "identifier" query param without "#" prefix.
 * @param week The splus "week" request param. ISO week of year below 52 or week of next year above 52.
 * @return ILecture[]
 */
router.get('/:schedule/:week', cors(), async (req, res) => {
  const schedule = req.params.schedule;
  const week = parseInt(req.params.week);
  const key = `${schedule}-${week}`;

  const data = await cache.wrap(key, async () => {
    console.log(`cache miss for key ${key}`);
    const lectures = await SplusApi.getData('#' + schedule, week);

    return lectures.map((lecture) => {
      const richLecture = {
        start: lectureAndWeekToDate(lecture, week),
        duration: lecture.end - lecture.begin,
        ...lecture,
      };
      delete richLecture.end;
      return richLecture;
    }, { ttl: SCHEDULE_CACHE_SECONDS });
  });

  res.set('Cache-Control', `public, max-age=${SCHEDULE_CACHE_SECONDS}`);
  res.json(data);
});

export default router;
