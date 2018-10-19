import * as express from 'express';
import { createHash } from 'crypto';
import * as cacheManager from 'cache-manager';
import { SplusApi } from '../lib/SplusApi';

const sha256 = (x) => createHash('sha256').update(x, 'utf8').digest('hex');

const router = express.Router();
const cache = cacheManager.caching({
  store: 'memory',
  max: 1000,
  ttl: 10,
});

router.get('/:course/:week', async (req, res) => {
  const course = req.params.course;
  const week = parseInt(req.params.week);
  const key = `${course}-${week}`;

  const data = await cache.wrap(key, async () => {
    console.log(`cache miss for key ${key}`);
    return await SplusApi.getData('#' + course, week);
  }, { ttl: 600 });
  const id = (lecture) => sha256(JSON.stringify({ lecture, course, week }));
  const result = data.map((lecture) => ({ ...lecture, course, week, id: id(lecture) }));

  res.json(result);
});

export default router;
