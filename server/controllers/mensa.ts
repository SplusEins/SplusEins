import express from 'express';

import { config } from '../config';
import dayjs from '../lib/dayjs';
import { cached } from '../lib/cache';
import { filterMensaOpenings } from '../lib/mensaOpenings';
import {
  MensaDayPlan,
  MensaMeal,
  Mensa,
  StwMensaMeal,
} from '../model/SplusEinsModel';

// abort requests if the API of the Studentenwerk is too slow to respond
const TIMEOUT_MILLISECONDS = 3000;
const CACHE_SECONDS = config.mensaCacheSeconds;
const STW_API = 'https://sls.api.stw-on.de/v1/location';
// Wolfenbüttel, Wolfsburg (Bistro 4U), Salzgitter, Suderburg
const MENSA_IDS = [130, 112, 200, 134];
const BISTRO_4U = 112;
const AMOUNT_OF_RETURNED_DAYS = 6;

const router = express.Router();

async function fetchStw<T>(path: string): Promise<T> {
  const response = await fetch(`${STW_API}/${path}`, {
    signal: AbortSignal.timeout(TIMEOUT_MILLISECONDS),
  });
  if (!response.ok) {
    throw new Error(`STW-ON replied ${response.status} for ${path}`);
  }
  return (await response.json()) as T;
}

/**
 * Load the meals of the next days, grouped by day.
 */
async function getDayPlans(id: number): Promise<MensaDayPlan[]> {
  // load everything from today until next week friday (and cut off AMOUNT_OF_RETURNED_DAYS further below)
  const startDate = dayjs().format('YYYY-MM-DD');
  const endDate = dayjs().add(1, 'weeks').isoWeekday(5).format('YYYY-MM-DD');

  const response = await fetchStw<{ meals: StwMensaMeal[] }>(
    `${id}/menu/${startDate}/${endDate}`,
  );
  const meals: MensaMeal[] = response.meals.map((meal) => ({
    // copy only neccessary fields
    date: meal.date,
    name: meal.name,
    price: meal.price,
    // use only name, we don't need the IDs
    categories: meal.tags.categories.map((category) => category.name),
    lane: meal.lane.name,
  }));

  return Object.entries(Object.groupBy(meals, (meal) => meal.date))
    .map(([date, meals]) => ({ date, meals: meals ?? [] }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, AMOUNT_OF_RETURNED_DAYS);
}

/**
 * Load a mensa with its opening hours and meals. Fails if one of the requests fails.
 */
function getMensa(id: number): Promise<Mensa> {
  const key = `mensa-${id}-${dayjs().format('YYYY-MM-DD')}`;
  return cached(key, CACHE_SECONDS, async () => {
    console.log(`mensa cache miss for key ${key}`);

    const [dayPlans, response] = await Promise.all([
      getDayPlans(id),
      fetchStw<Mensa>(`${id}`),
    ]);
    const page = response.id === BISTRO_4U ? 'bistro4u' : 'mensa';

    return {
      // copy only neccessary fields
      name: response.name,
      id: response.id,
      dayPlans,
      url: `${response.address.city.toLowerCase()}/essen/${page}`,
      opening_hours: filterMensaOpenings(response.opening_hours, response.id),
      address: response.address,
    };
  });
}

/**
 * Get all mensas of the Ostfalia. Mensas which could not be loaded are left out.
 */
router.get('/', async (req, res, next) => {
  const results = await Promise.allSettled(MENSA_IDS.map(getMensa));
  const mensas = results
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value);
  const errors = results
    .filter((result) => result.status === 'rejected')
    .map((result) => result.reason);
  errors.forEach((error) => console.error('Error loading mensa:', error));

  if (mensas.length === 0) {
    if (errors.some((error) => error?.name === 'TimeoutError')) {
      res.status(504).send('Mensa request to STW-ON timed out'); // Gateway timeout, STW-ON API is down
    } else {
      next(errors[0]);
    }
    return;
  }

  // do not keep incomplete results for long
  res.set(
    'Cache-Control',
    errors.length === 0 ? `public, max-age=${CACHE_SECONDS}` : 'no-cache',
  );
  res.json(mensas);
});

export default router;
