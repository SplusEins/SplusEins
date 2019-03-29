import * as express from 'express';
import * as cors from 'cors';
import * as cacheManager from 'cache-manager';
import * as fsStore from 'cache-manager-fs-hash';
import * as moment from 'moment';
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { URLSearchParams } from 'url';

import { NewsElement } from '../../model/v2/SplusEinsModel';

// default must be in /tmp because the rest is RO on AWS Lambda
const CACHE_PATH = process.env.CACHE_PATH || '/tmp/spluseins-cache';
const CACHE_DISABLE = !!process.env.CACHE_DISABLE;
const CACHE_SECONDS = parseInt(process.env.NEWS_CACHE_SECONDS || '1800');

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
 * @returns NewsElement[]
 */
router.get('/ostfalia', cors(), async (req, res, next) => {
  const key = 'ostfalia-news';

  try {
    const data = await cache.wrap(key, async () => {
      console.log(`ostfalia news cache miss for key ${key}`);

      const query = new URLSearchParams();
      query.append('itemsPerPage', '10');
      query.append('collectorParam',
        'fq=type:of-news' +
        '&fq=parent-folders:"/sites/default/de/campus/.content/newsentries10/"' +
        '&sort=newsdate_de_dt desc' +
        '|createPath=/sites/default/de/campus/.content/newsentries10/news_%(number).xml');
      query.append('showDate', 'true');
      query.append('currPage', '1');

      const response = await fetch(
        'https://www.ostfalia.de/cms/system/modules/de.ostfalia.module.template/elements/renderNewsList.jsp', {
          method: 'POST',
          body: query,
        }).then((res) => res.text());

      const $ = cheerio.load(response);
      return $('article').map(function(i, article) {
        return <NewsElement> {
          title: $('a', this).text().trim(),
          link: 'https://www.ostfalia.de' + $('a', this).attr('href'),
          text: $('p', this).last().text().trim(),
          date: moment($('p', this).first().text().trim(), 'DD.MM.YY').utcOffset('+0100').toDate(),
        };
      }).get();
    }, { ttl: CACHE_SECONDS });

    res.set('Cache-Control', `public, max-age=${CACHE_SECONDS}`);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * Get Ostfalia faculty news
 * @returns NewsElement[]
 */
router.get('/ostfalia/:faculty', cors(), async (req, res, next) => {
  const faculty = req.params.faculty;
  if (!['i', 'r', 'e', 'sz', 'wf', 'wob', 'sud'].includes(faculty)) {
    // Informatik, Recht, Elektrotechnik,
    // Salzgitter, Wolfenbüttel, Wolfsburg, Suderburg
    res.set('Cache-Control', `public, max-age=${CACHE_SECONDS}`);
    res.sendStatus(404);
    return;
  }
  const key = 'ostfalia-news-' + faculty;

  try {
    let url;
    if (faculty.length == 1) {
      url = 'https://www.ostfalia.de/cms/de/' + faculty;
    } else {
      url = 'https://www.ostfalia.de/cms/de/campus/' + faculty;
    }

    const data = await cache.wrap(key, async () => {
      console.log(`ostfalia faculty news cache miss for key ${key}`);

      const response = await fetch(url)
        .then((res) => res.text());
      const $ = cheerio.load(response);

      if (faculty == 'e') {
        return $('article').eq(1).find('.ostfalia-content div').map(function(i, paragraph) {
          const p = $('p', this).last();
          const text = p.text();
          return <NewsElement> {
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
          if (!!link && !link.startsWith('http')) {
            link = 'https://www.ostfalia.de' + link;
          } else {
            link = '';
          }

          return <NewsElement> {
            title: $(this).text().trim(),
            link,
            text: '',
          }
        }).get();
      }

      return $('article.news-campus').map(function(i, article) {
        return <NewsElement> {
          title: $('a', this).text().trim(),
          link: 'https://www.ostfalia.de' + $('a', this).attr('href'),
          text: $('p', this).last().text().trim(),
          date: moment($('p', this).first().text().trim(), 'DD.MM.YY').utcOffset('+0100').toDate(),
        };
      }).get();
    }, { ttl: CACHE_SECONDS });

    res.set('Cache-Control', `public, max-age=${CACHE_SECONDS}`);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * Get Campus38 news
 * @returns NewsElement[]
 */
router.get('/campus38', cors(), async (req, res, next) => {
  const key = 'campus38-news';

  try {
    const data = await cache.wrap(key, async () => {
      console.log(`campus38 news cache miss for key ${key}`);

      const response = await fetch('https://www.campus38.de/newsfeed.xml')
        .then((res) => res.text());
      const $ = cheerio.load(response, { xmlMode: true });
      return $('entry').map(function(i, article) {
        return <NewsElement> {
          title: $('title', this).text().trim(),
          link: $('link', this).attr('href'),
          text: $('summary', this).text().trim(),
          date: moment($('published', this).text().trim().split('T')[0]).utcOffset('+0100').toDate(),
        };
      }).slice(0, 10).get();
    }, { ttl: CACHE_SECONDS });

    res.set('Cache-Control', `public, max-age=${CACHE_SECONDS}`);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
