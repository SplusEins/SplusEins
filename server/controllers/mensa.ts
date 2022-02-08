import * as express from 'express';
import * as cacheManager from 'cache-manager';
import * as fsStore from 'cache-manager-fs-hash';
import * as moment from 'moment';
import fetch from 'node-fetch';

import { MensaDayPlan, MensaMeal } from '../model/SplusEinsModel';
import timeoutSignal = require('timeout-signal')

// default must be in /tmp because the rest is RO on AWS Lambda
const CACHE_PATH = process.env.CACHE_PATH || '/tmp/spluseins-cache';
const CACHE_DISABLE = !!process.env.CACHE_DISABLE;
const CACHE_SECONDS = parseInt(process.env.MENSA_CACHE_SECONDS || '1800');

const router = express.Router();
const cache = CACHE_DISABLE
  ? cacheManager.caching({ store: 'memory', max: 0 })
  : cacheManager.caching({
    store: fsStore,
    options: {
      path: CACHE_PATH,
      ttl: 60,
      subdirs: true
    }
  });

// from https://stackoverflow.com/a/34890276/4026792
// group list of objects by object key
const groupBy = function (xs, key) {
  return xs.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

/**
 * Accept CORS preflight requests.
 */
router.options('/');

/**
 * Request OpenMensa API
 * - first fetch open days
 * - then select first 6 open days
 * - then fetch plan for selected days
 *
 * @return MensaDayPlan[]
 */
router.get('/', async (req, res, next) => {
  const key = 'mensa-' + moment().format('YYYY-MM-DD');
  const amountOfReturnedDays = 6;

  try {
    const data = await cache.wrap(key, async () => {
      console.log(`mensa cache miss for key ${key}`);

      // load everything from today until next week friday (and cut off amountOfReturnedDays further below)
      const startDate = moment().format('YYYY-MM-DD')
      const endDate = moment().add(1, 'weeks').isoWeekday(5).format('YYYY-MM-DD')

      const signal = timeoutSignal(3000) // abort if openmensa is too slow to respond
      const response = await fetch(`https://sls.api.stw-on.de/v1/location/130/menu/${startDate}/${endDate}`, { signal })
        .then((res) => res.json());
      const meals:MensaMeal[] = response.meals.map(itm => {
        return {
          // copy only neccessary fields
          date: itm.date,
          name: itm.name,
          price: itm.price,
          // use only name, we don't need the IDs
          categories: itm.tags.categories.map(el => el.name),
          lane: itm.lane.name
        }
      })
      timeoutSignal.clear(signal)

      // return meals as groups per day
      const convertedMeals = groupBy(meals, 'date')
      const result: MensaDayPlan[] = [];
      for (const [key, value] of Object.entries(convertedMeals)) {
        result.push(<MensaDayPlan>{ date: (key as string), meals: value });
      }

      return result.sort((a, b) => moment(a.date).isBefore(moment(b.date)) ? -1 : 1).slice(0, amountOfReturnedDays);
    }, { ttl: CACHE_SECONDS });

    res.set('Cache-Control', `public, max-age=${CACHE_SECONDS}`);
    if (data.length === 0) {
      res.sendStatus(204); // request ok, but no data
    } else {
      res.json(data);
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'The user aborted a request.') {
      res.status(504).send('Mensa request to STW-ON timed out'); // Gateway timeout, STW-ON API is down
      return;
    }
    next(error);
  }
});

export default router;
