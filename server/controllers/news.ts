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
router.options('/ostfalia', cors());
router.options('/ostfalia/:faculty', cors());
router.options('/campus38', cors());

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

/**
 * Get Ostfalia faculty news
 */
router.get('/ostfalia/:faculty', cors(), async (req, res, next) => {
  const faculty = req.params.faculty;
  if (!['i', 'r', 'e', 'sz', 'wf', 'wob', 'sud'].includes(faculty)) {
    // Informatik, Recht, Elektrotechnik,
    // Salzgitter, Wolfenbüttel, Wolfsburg, Suderburg
    res.send(404);
    return;
  }
  const key = 'ostfalia-news-' + faculty + '-' + moment().format('YYYY-MM-DD');

  try {
    let url;
    if (faculty.length == 1) {
      url = 'https://www.ostfalia.de/cms/de/' + faculty;
    } else {
      url = 'https://www.ostfalia.de/cms/de/campus/' + faculty;
    }

    const data = await cache.wrap(key, async () => {
      console.log(`ostfalia faculty news cache miss for key ${key}`);

      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      if (faculty == 'e') {
        return $('article').eq(1).find('.ostfalia-content div').map(function(i, paragraph) {
          const p = $('p', this).last();
          const text = p.text();
          return {
            title: text.substring(text.indexOf(':') + 1,
              text.indexOf('mehr')).trim(),
            link: 'https://www.ostfalia.de' + $('a', p).attr('href'),
            text: '',
          }
        }).get();
      }

      if (faculty == 'i') {
        return $('article .ostfalia-content table tbody td').map(function(i, td) {
          let link = $('a', this).first().attr('href');
          if (!link.startsWith('http')) {
            link = 'https://www.ostfalia.de' + link;
          }

          return {
            title: $(this).text().trim(),
            link,
            text: '',
          }
        }).get();
      }

      return $('article.news-campus').map(function(i, article) {
        return {
          title: $('a', this).text().trim(),
          link: 'https://www.ostfalia.de' + $('a', this).attr('href'),
          text: $('p', this).last().text().trim(),
          date: moment(
            $('p', this).first().text().trim(),
            'DD.MM.YY').format('YYYY-MM-DD'),
        };
      }).get();
    }, { ttl: NEWS_CACHE_SECONDS });

    res.set('Cache-Control', `public, max-age=${NEWS_CACHE_SECONDS}`);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * Get Campus38 news
 */
router.get('/campus38', cors(), async (req, res, next) => {
  const key = 'campus38-news-' + moment().format('YYYY-MM-DD');

  try {
    const data = await cache.wrap(key, async () => {
      console.log(`campus38 news cache miss for key ${key}`);

      const response = await axios.get('https://www.campus38.de');
      const $ = cheerio.load(response.data);
      return $('.article').map(function(i, article) {
        return {
          title: $('a', this).attr('title').trim(),
          link: 'https://www.campus38.de' + $('a', this).attr('href'),
          text: $('p', this).text().trim(),
          date: $('time').attr('datetime'),
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
