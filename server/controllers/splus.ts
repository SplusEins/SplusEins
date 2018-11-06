import * as express from 'express';
import { createHash } from 'crypto';
import * as cacheManager from 'cache-manager';
import * as fsStore from 'cache-manager-fs-hash';
import { SplusApi } from '../lib/SplusApi';

const SCHEDULE_CACHE_SECONDS = 600;

const sha256 = (x) => createHash('sha256').update(x, 'utf8').digest('hex');

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

/**
 * Get all lectures for the given schedule and week.
 *
 * @param schedule The splus "identifier" query param without "#" prefix.
 * @param week The splus "week" request param. ISO week of year below 52 or week of next year above 52.
 * @return ILecture[]
 */
router.get('/:schedule/:week', async (req, res) => {
  const schedule = req.params.schedule;
  const week = parseInt(req.params.week);
  const key = `${schedule}-${week}`;

  const data = await cache.wrap(key, async () => {
    console.log(`cache miss for key ${key}`);
    return await SplusApi.getData('#' + schedule, week);
  }, { ttl: SCHEDULE_CACHE_SECONDS });
  const id = (lecture) => sha256(JSON.stringify({ lecture, schedule, week }));
  const result = data.map((lecture) => ({ ...lecture, schedule, week, id: id(lecture) }));

  res.set('Cache-Control', `public, max-age=${SCHEDULE_CACHE_SECONDS}`);
  res.set('Access-Control-Allow-Origin', '*');
  res.json(result);
});

export default router;
