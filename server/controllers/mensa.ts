import express from 'express';

import dayjs from '../lib/dayjs';
import { cached } from '../lib/cache';
import {
  MensaDayPlan,
  MensaMeal,
  Mensa,
  MensaOpening,
  StwMensaMeal,
} from '../model/SplusEinsModel';

// abort requests if the API of the Studentenwerk is too slow to respond
const TIMEOUT_MILLISECONDS = 3000;

const CACHE_SECONDS = parseInt(process.env.MENSA_CACHE_SECONDS || '1800');

const router = express.Router();
// from https://stackoverflow.com/a/34890276/4026792
// group list of objects by object key
const groupBy = function (xs, key) {
  return xs.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

/**
 * Request OpenMensa API
 * - first fetch open days
 * - then select first 6 open days
 * - then fetch plan for selected days
 *
 * @return MensaDayPlan[]
 */
async function getDayPlan(id): Promise<MensaDayPlan[]> {
  const key = 'mensa-' + id + '-' + dayjs().format('YYYY-MM-DD');
  const amountOfReturnedDays = 6;

  try {
    const data = await cached(key, CACHE_SECONDS, async () => {
      console.log(`mensa cache miss for key ${key}`);

      // load everything from today until next week friday (and cut off amountOfReturnedDays further below)
      const startDate = dayjs().format('YYYY-MM-DD');
      const endDate = dayjs()
        .add(1, 'weeks')
        .isoWeekday(5)
        .format('YYYY-MM-DD');

      const response = (await fetch(
        `https://sls.api.stw-on.de/v1/location/${id}/menu/${startDate}/${endDate}`,
        { signal: AbortSignal.timeout(TIMEOUT_MILLISECONDS) },
      ).then((res) => res.json())) as { meals: StwMensaMeal[] };
      const meals: MensaMeal[] = response.meals.map((itm) => {
        return {
          // copy only neccessary fields
          date: itm.date,
          name: itm.name,
          price: itm.price,
          // use only name, we don't need the IDs
          categories: itm.tags.categories.map((el) => el.name),
          lane: itm.lane.name,
        };
      });
      // return meals as groups per day
      const convertedMeals = groupBy(meals, 'date');
      const result: MensaDayPlan[] = [];
      for (const [key, value] of Object.entries(convertedMeals)) {
        result.push(<MensaDayPlan>{ date: key as string, meals: value });
      }

      return result
        .sort((a, b) => (dayjs(a.date).isBefore(dayjs(b.date)) ? -1 : 1))
        .slice(0, amountOfReturnedDays);
    });

    return data;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Error getDayPlan:', msg, error);
  }
}

function filterMensaOpenings(
  entries: MensaOpening[],
  mensaId?: number,
): MensaOpening[] {
  // special handling for Suderburg, since the API returns multiple opening hours (only one is correct)
  if (mensaId === 134) {
    // Suderburg: prefer 12:00–13:30 entries (source: stw-on.de/suderburg/essen/mensa)
    const filtered = entries.filter(
      (entry) =>
        entry.start_time === '12:00:00' &&
        entry.end_time === '13:30:00' &&
        entry.end_day !== 0,
    );

    if (filtered.length > 0) {
      return filtered.map((entry) => ({ ...entry, start_day: 1 }));
    }
    // fallback: if the opening hours are changed at some point, just continue with the default filtering below
  }

  return entries.filter((entry) => {
    // Filter alle Einträge, die nur am Wochenende sind
    if (entry.start_day in [6, 0] && entry.end_day in [6, 0]) {
      return false;
    }

    // Remappe die Einträge auf Woche
    if (entry.start_day in [6, 0]) {
      entry.start_day = 1;
    }
    if (entry.end_day in [6, 0]) {
      entry.end_day = 5;
    }

    return true;
  });
}

router.get('/', async (req, res, next) => {
  let mensaList: Mensa[] = [];
  const mensaIDs = [130, 112, 200, 134]; // list of ostfalia mensas
  const mensaPromises = mensaIDs.map(async (mensaID) => {
    const key = 'mensa-' + mensaID;
    try {
      const data = await cached(key, CACHE_SECONDS, async () => {
        console.log(`mensa cache miss for key ${key}`);

        const dayPlans = await getDayPlan(mensaID);

        const response: Mensa = (await fetch(
          `https://sls.api.stw-on.de/v1/location/${mensaID}`,
          { signal: AbortSignal.timeout(TIMEOUT_MILLISECONDS) },
        ) // 130 is WF mensa
          .then((res) => res.json())) as Mensa;

        let url;
        switch (response.id) {
          case 112:
            url = 'bistro4u';
            break;

          default:
            url = 'mensa';
            break;
        }

        const mensa: Mensa = {
          // copy only neccessary fields
          name: response.name,
          id: response.id,
          dayPlans,
          url: `${response.address.city.toLowerCase()}/essen/${url}`,
          opening_hours: filterMensaOpenings(
            response.opening_hours,
            response.id,
          ) /* .map(({ ['time']: _, ...rest }) => rest) */
            .filter(
              (obj, index, self) =>
                index ===
                self.findIndex(
                  (t) => JSON.stringify(t) === JSON.stringify(obj),
                ),
            ),
          address: response.address,
        };
        return mensa;
      });
      return data;
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        if (res.headersSent) return; // another mensa request already failed
        res.status(504).send('Mensa request to STW-ON timed out'); // Gateway timeout, STW-ON API is down
        return;
      }
      next(error);
    }
  });

  Promise.all(mensaPromises).then((results) => {
    if (res.headersSent) return; // an error was already sent
    // Filter out any empty results due to errors
    mensaList = results.filter(Boolean) as Mensa[];

    res.set('Cache-Control', `public, max-age=${CACHE_SECONDS}`);
    if (mensaList.length === 0) {
      res.sendStatus(204); // request ok, but no data
    } else {
      res.json(mensaList);
    }
  });
});

export default router;
