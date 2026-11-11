import express from 'express';
import { cached } from '../lib/cache';

import { createClient } from '@motis-project/motis-fptf-client';
import { profile } from '@motis-project/motis-fptf-client/p/transitous';

// create a client with Transitous profile (disable station enrichment to avoid import/path issues with db-hafas-stations)
const motisClient = createClient(
  profile,
  'spluseins.de/team@spluseins.de/05.11.25',
  { enrichStations: false },
); // in case of changes, adjust the version date accordingly

const CACHE_SECONDS = parseInt(process.env.BUS_CACHE_SECONDS || '60');

const router = express.Router();

router.get('/', async (req, res, next) => {
  const motisOpts = {
    results: 5,
    language: 'de',
    startWithWalking: false,
  };

  const exer = 'de-DELFI_de:03158:599:0:1'; // await motisClient.locations('Wolfenbüttel Exer Süd')
  const fh = 'de-DELFI_de:03158:598:0:1';

  try {
    const data = await cached('bus', CACHE_SECONDS, async () => {
      console.log('bus cache miss for key bus');

      const exerToFh = await motisClient.journeys(exer, fh, motisOpts);
      const fhToExer = await motisClient.journeys(fh, exer, motisOpts);
      const extractDateAndLine = (journeys) =>
        journeys
          .map(({ legs }) => legs)
          .filter((legs) => legs.length === 1)
          .map((legs) => legs[0])
          .map((leg) => ({
            date: leg.departure,
            line: leg.line.name.replace('Bus ', ''), // remove Bus string at start
          }))
          .sort((a, b) => Date.parse(a) - Date.parse(b));

      return {
        departures: {
          exerToFh: extractDateAndLine(exerToFh.journeys),
          fhToExer: extractDateAndLine(fhToExer.journeys),
        },
        lastUpdated: Date.now(),
      };
    });

    res.set('Cache-Control', `public, max-age=${CACHE_SECONDS}`);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
