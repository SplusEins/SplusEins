import * as express from 'express';
import * as cors from 'cors';
import * as cacheManager from 'cache-manager';
import * as fsStore from 'cache-manager-fs-hash';
import * as moment from 'moment';

import { SplusApi } from '../lib/SplusApi';
import { RichLecture } from '../model/RichLecture';

const TIMETABLE_CACHE_SECONDS = 600;

// default must be in /tmp because the rest is RO on AWS Lambda
const CACHE_PATH = process.env.CACHE_PATH || '/tmp/spluseins-cache';
const CACHE_DISABLE = !!process.env.CACHE_DISABLE;

const router = express.Router();
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
 * Accept CORS preflight requests.
 */
router.options('/:timetable/:week', cors());

/**
 * Get all lectures for the given timetable and week.
 *
 * @param timetable The splus "identifier" query param without "#" prefix.
 * @param week The splus "week" request param. ISO week of year below 52 or week of next year above 52.
 * @return RichLecture[]
 */
router.get('/:timetable/:week', cors(), async (req, res) => {
  const timetable = req.params.timetable;
  const week = parseInt(req.params.week);
  const key = `${timetable}-${week}`;

  const data = await cache.wrap(key, async () => {
    console.log(`cache miss for key ${key}`);
    const lectures = await SplusApi.getData('#' + timetable, week);

    return lectures.map((ilecture) => new RichLecture(ilecture, week));
  }, { ttl: TIMETABLE_CACHE_SECONDS });

  res.set('Cache-Control', `public, max-age=${TIMETABLE_CACHE_SECONDS}`);
  res.json(data);
});

export default router;
