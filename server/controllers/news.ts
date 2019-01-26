import * as express from 'express';
import * as cors from 'cors';
import * as cacheManager from 'cache-manager';
import * as fsStore from 'cache-manager-fs-hash';
import * as moment from 'moment';
import * as cheerio from 'cheerio';

const NEWS_CACHE_SECONDS = 1800;

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
 * Get Ostfalia news
 */
router.get('/ostfalia', cors(), async (req, res, next) => {
  const key = 'ostfalia-news-' + moment().format('YYYY-MM-DD');

  try {
    const data = await cache.wrap(key, async () => {
      console.log(`ostfalia news cache miss for key ${key}`);

      const response = await axios.get('https://www.ostfalia.de/cms/de');
      const $ = cheerio.load(response.data);
      return $('article.news-box').map(function(i, article) {
        return {
          title: $('a', this).text().trim(),
          link: 'https://www.ostfalia.de' + $('a', this).attr('href'),
          text: $('p', this).text().trim(),
        };
      }).get();
    }, { ttl: NEWS_CACHE_SECONDS });

    res.set('Cache-Control', `public, max-age=${NEWS_CACHE_SECONDS}`);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
