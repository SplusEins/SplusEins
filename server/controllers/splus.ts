import * as express from 'express';
import { createHash } from 'crypto';
import * as cacheManager from 'cache-manager';
import * as fsStore from 'cache-manager-fs-hash';
import { SplusApi } from '../lib/SplusApi';

const sha256 = (x) => createHash('sha256').update(x, 'utf8').digest('hex');

const router = express.Router();
const cache = cacheManager.caching({
  store: fsStore,
  options: {
    path: '/tmp/spluseins-cache', // TODO make this configurable
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
  }, { ttl: 600 });
  const id = (lecture) => sha256(JSON.stringify({ lecture, schedule, week }));
  const result = data.map((lecture) => ({ ...lecture, schedule, week, id: id(lecture) }));

  res.json(result);
});

export default router;
