import * as express from 'express';
import * as cors from 'cors';
import * as cacheManager from 'cache-manager';
import * as fsStore from 'cache-manager-fs-hash';
import * as moment from 'moment';

const MENSA_CACHE_SECONDS = 1800;

// default must be in /tmp because the rest is RO on AWS Lambda
const CACHE_PATH = process.env.CACHE_PATH || '/tmp/spluseins-cache';
const CACHE_DISABLE = !!process.env.CACHE_DISABLE;

const axios = require('axios');
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
router.options('/', cors());

/**
 * Request OpenMensa API
 * - first fetch open days
 * - then select first 3 open days
 * - then fetch plan for selected days
 *
 * @return {date: number (acts also id), data: {}}
 */
router.get('/', cors(), async (req, res, next) => {
  const key = moment().format('YYYY-MM-DD');
  let openDays = [];
  let weekdays = [];
  let result = [];

  try {
    const data = await cache.wrap(key, async () => {
      console.log(`mensa cache miss for key ${key}`);

      const response = await axios.get(`https://openmensa.org/api/v2/canteens/166/days`);
      openDays = response.data;

      for(let i=0; i<3; i++) {
        weekdays.push(moment(openDays[i].date));
      }
  
      await Promise.all(weekdays.map(async (day) => {
        const response = await axios.get(`https://openmensa.org/api/v2/canteens/166/days/${day.format('YYYY-MM-DD')}/meals`);
        result.push({date: parseInt(day.format('YYYYMMDD')), data: {...response.data}});
      }));

      return result.sort((a,b) => a.date - b.date);
    }, { ttl: MENSA_CACHE_SECONDS });

    res.set('Cache-Control', `public, max-age=${MENSA_CACHE_SECONDS}`);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
