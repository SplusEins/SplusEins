import express from 'express';

import { config } from '../config';
import dayjs from '../lib/dayjs';
import { cached } from '../lib/cache';
import { filterMensaOpenings } from '../lib/mensaOpenings';
import {
  MensaDayPlan,
  MensaMeal,
  Mensa,
  StwLocation,
  StwMensaMeal,
} from '../model/SplusEinsModel';
import { isRecord } from '../lib/isRecord';
import LOCATION_OF_FACULTY from '../assets/locationOfFaculty.json';

// abort requests if the API of the Studentenwerk is too slow to respond
const TIMEOUT_MILLISECONDS = 3000;
const CACHE_SECONDS = config.mensaCacheSeconds;
const STW_API = 'https://sls.api.stw-on.de/v1/location';
// STW-ON id and key of the location, the web client remembers the selection by key
const MENSAS = [
  { id: 130, key: 'wf' }, // Wolfenbüttel
  { id: 112, key: 'wob' }, // Wolfsburg (Bistro 4U)
  { id: 200, key: 'sz' }, // Salzgitter
  { id: 134, key: 'sud' }, // Suderburg
];
const BISTRO_4U = 112;
const AMOUNT_OF_RETURNED_DAYS = 6;

const router = express.Router();

async function fetchStw(path: string): Promise<unknown> {
  const response = await fetch(`${STW_API}/${path}`, {
    signal: AbortSignal.timeout(TIMEOUT_MILLISECONDS),
  });
  if (!response.ok) {
    throw new Error(`STW-ON replied ${response.status} for ${path}`);
  }
  return response.json();
}

function isStwLocation(location: unknown): location is StwLocation {
  return (
    isRecord(location) &&
    typeof location.id === 'number' &&
    typeof location.name === 'string' &&
    isRecord(location.address) &&
    typeof location.address.city === 'string' &&
    Array.isArray(location.opening_hours)
  );
}

function isStwMensaMeal(meal: unknown): meal is StwMensaMeal {
  return (
    isRecord(meal) &&
    typeof meal.date === 'string' &&
    typeof meal.name === 'string' &&
    isRecord(meal.price) &&
    isRecord(meal.lane) &&
    typeof meal.lane.name === 'string' &&
    isRecord(meal.tags) &&
    Array.isArray(meal.tags.categories) &&
    meal.tags.categories.every(
      (category) => isRecord(category) && typeof category.name === 'string',
    )
  );
}

/**
 * Load the meals of the next days, grouped by day.
 */
async function getDayPlans(id: number): Promise<MensaDayPlan[]> {
  // load everything from today until next week friday (and cut off AMOUNT_OF_RETURNED_DAYS further below)
  const startDate = dayjs().format('YYYY-MM-DD');
  const endDate = dayjs().add(1, 'weeks').isoWeekday(5).format('YYYY-MM-DD');

  const response = await fetchStw(`${id}/menu/${startDate}/${endDate}`);
  if (!isRecord(response) || !Array.isArray(response.meals)) {
    throw new Error(`STW-ON returned no meals for ${id}`);
  }
  const meals: MensaMeal[] = response.meals
    .filter(isStwMensaMeal)
    .map((meal) => ({
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
function getMensa({
  id,
  key: mensaKey,
}: (typeof MENSAS)[number]): Promise<Mensa> {
  const key = `mensa-v3-${id}-${dayjs().format('YYYY-MM-DD')}`;
  return cached(key, CACHE_SECONDS, async () => {
    console.log(`mensa cache miss for key ${key}`);

    const [dayPlans, response] = await Promise.all([
      getDayPlans(id),
      fetchStw(`${id}`),
    ]);
    if (!isStwLocation(response)) {
      throw new Error(`STW-ON returned an invalid location for ${id}`);
    }
    const page = response.id === BISTRO_4U ? 'bistro4u' : 'mensa';

    return {
      // copy only neccessary fields
      name: response.name,
      id: response.id,
      key: mensaKey,
      dayPlans,
      url: `https://www.stw-on.de/${response.address.city.toLowerCase()}/essen/${page}`,
      opening_hours: filterMensaOpenings(response.opening_hours, response.id),
      address: response.address,
      faculties: Object.entries(LOCATION_OF_FACULTY)
        .filter(([, location]) => location.toLowerCase() === mensaKey)
        .map(([faculty]) => faculty),
    };
  });
}

/**
 * Get all mensas of the Ostfalia. Mensas which could not be loaded are left out.
 */
router.get('/', async (req, res, next) => {
  const results = await Promise.allSettled(MENSAS.map(getMensa));
  const mensas = results
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value);
  const errors = results
    .filter((result) => result.status === 'rejected')
    .map((result): unknown => result.reason);
  errors.forEach((error) => console.error('Error loading mensa:', error));

  if (mensas.length === 0) {
    if (
      errors.some(
        (error) => error instanceof Error && error.name === 'TimeoutError',
      )
    ) {
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
