import * as express from 'express';
import * as cors from 'cors';
import * as cacheManager from 'cache-manager';
import * as fsStore from 'cache-manager-fs-hash';
import * as moment from 'moment';

import * as createClient from 'hafas-client';
import * as dbProfile from 'hafas-client/p/db'

// create a client with Deutsche Bahn profile
const hafasClient = createClient(dbProfile, 'spluseins.de')

// default must be in /tmp because the rest is RO on AWS Lambda
const CACHE_PATH = process.env.CACHE_PATH || '/tmp/spluseins-cache';
const CACHE_DISABLE = !!process.env.CACHE_DISABLE;
const CACHE_SECONDS = parseInt(process.env.BUS_CACHE_SECONDS || '60');

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

router.options('/', cors());

router.get('/', cors(), async (req, res, next) => {
  const key = 'bus-' + moment().format('YYYY-MM-DD_HH-mm');
  const hafasOpts = {
    results: 5,
    language: 'de',
    startWithWalking: false,
  }

  const exer = '891011' // await hafasClient.locations('Wolfenbüttel Exer Süd')
  const fh = '891038'

  try {
    const data = await cache.wrap(key, async () => {
      console.log(`bus cache miss for key ${key}`);

      const exerToFh = await hafasClient.journeys(exer, fh, hafasOpts)
      const fhToExer = await hafasClient.journeys(fh, exer, hafasOpts)
      const extractDateAndLine = (journeys) => journeys
        .map(({ legs }) => legs)
        .filter(legs => legs.length == 1)
        .map(legs => legs[0])
        .map(leg => ({
          date: leg.departure,
          line: leg.line.name,
        }))

      return {
        exerToFh: extractDateAndLine(exerToFh.journeys),
        fhToExer: extractDateAndLine(fhToExer.journeys),
      }
    }, { ttl: CACHE_SECONDS });

    res.set('Cache-Control', `public, max-age=${CACHE_SECONDS}`);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
