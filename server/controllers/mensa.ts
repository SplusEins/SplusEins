import * as express from 'express';
import * as cors from 'cors';
import * as cacheManager from 'cache-manager';
import * as fsStore from 'cache-manager-fs-hash';
import * as moment from 'moment';
import fetch from 'node-fetch';
import { parseStringPromise } from 'xml2js';

import { MensaDayPlan } from '../model/SplusEinsModel';

// default must be in /tmp because the rest is RO on AWS Lambda
const CACHE_PATH = process.env.CACHE_PATH || '/tmp/spluseins-cache';
const CACHE_DISABLE = !!process.env.CACHE_DISABLE;
const CACHE_SECONDS = parseInt(process.env.MENSA_CACHE_SECONDS || '1800');

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
 * @return MensaDayPlan[]
 */
router.get('/', cors(), async (req, res, next) => {
  const key = 'mensa-' + moment().format('YYYY-MM-DD');

  try {
    const data = await cache.wrap(key, async () => {
      console.log(`mensa cache miss for key ${key}`);

      const feed = await fetch('https://openmensa.schneefux.xyz/ostniedersachsen/wolfenbuettel/full.xml')
        .then((res) => res.text())
        .then(parseStringPromise) as any;

      const result: MensaDayPlan[] = [];

      feed.openmensa.canteen[0].day.forEach((day: any) => {
        const dayDate = moment(day.$.date).toDate();
        day.category.forEach((category) => {
          const data = {
            category: category.$.name,
            id: `${dayDate.valueOf()}-${category.$.name}-${category.meal[0].name[0]}`,
            name: category.meal[0].name[0],
            prices: category.meal[0].price.reduce((prices, price) => ({
              ...prices,
              [price.$.role]: price._,
            }), {}),
            notes: category.meal[0].note,
          };

          result.push(<MensaDayPlan> { date: dayDate, data });
        })
      });

      return result.sort((a,b) => moment(a.date).isBefore(moment(b.date)) ? -1 : 1);
    }, { ttl: CACHE_SECONDS });

    res.set('Cache-Control', `public, max-age=${CACHE_SECONDS}`);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
