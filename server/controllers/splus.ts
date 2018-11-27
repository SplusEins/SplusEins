import * as express from 'express';
import * as cors from 'cors';
import * as cacheManager from 'cache-manager';
import * as fsStore from 'cache-manager-fs-hash';
import * as moment from 'moment';

import { SplusApi } from '../lib/SplusApi';
import { RichLecture } from '../model/RichLecture';

const SCHEDULE_CACHE_SECONDS = 600;
const MENSA_CACHE_SECONDS = 3600;

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
router.options('/:schedule/:week', cors());
router.options('/mensa', cors());

/**
 * Get all lectures for the given schedule and week.
 *
 * @param schedule The splus "identifier" query param without "#" prefix.
 * @param week The splus "week" request param. ISO week of year below 52 or week of next year above 52.
 * @return RichLecture[]
 */
router.get('/:schedule/:week', cors(), async (req, res, next) => {
  const schedule = req.params.schedule;
  const week = parseInt(req.params.week);
  const key = `${schedule}-${week}`;

  try {
    const data = await cache.wrap(key, async () => {
      console.log(`timetable cache miss for key ${key}`);
      const lectures = await SplusApi.getData('#' + schedule, week);
      return lectures.map((ilecture) => new RichLecture(ilecture, week));
    }, { ttl: SCHEDULE_CACHE_SECONDS });

    res.set('Cache-Control', `public, max-age=${SCHEDULE_CACHE_SECONDS}`);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * Request OpenMensa API
 * - first fetch open days
 * - then select first 3 open days
 * - then fetch plan for selected days
 *
 * @return {id: number, date: string, data: {}}
 */
router.get('/mensa', cors(), async (req, res, next) => {
  const key = (new Date()).toString();
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
        result.push({id: day.month() + day.day(), date: day.format('YYYY-MM-DD'), data: {...response.data}});
      }));

      return result.sort((a,b) => a.id - b.id);
    }, { ttl: MENSA_CACHE_SECONDS });

    res.set('Cache-Control', `public, max-age=${MENSA_CACHE_SECONDS}`);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
