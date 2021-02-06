import * as express from 'express';
import * as rss from 'rss';
import { } from 'rss';
import getNews from '../lib/NewsApi'
import { NewsElement } from '~/model/SplusEinsModel';
import * as crypto from 'crypto';

const CACHE_SECONDS = parseInt(process.env.NEWS_CACHE_SECONDS || '1800');
const router = express.Router();

const MAX_NEWS_ITEMS = 100;

/**
 * Accept CORS preflight requests.
 */
router.options('/:faculties.rss');
router.options('/:faculties');

router.get('/:faculties.rss', async (req, res, next) => {
  const faculties = <string[]>req.params.faculties.split(',');
  let limit = parseInt(req.query.limit) || MAX_NEWS_ITEMS;
  if (limit > MAX_NEWS_ITEMS) limit = MAX_NEWS_ITEMS;

  try {
    const news = await getNews(faculties, limit);
    const feed = new rss({ title: '', feed_url: '', site_url: '' });
    const generateUid = (article: NewsElement) => (
      crypto.createHash('sha1').update(article.title + article.date).digest('base64').slice(0, 7)
    )
    news.map(newsEl => {
      return {
        title: newsEl.title,
        description: newsEl.text,
        url: newsEl.link,
        categories: [newsEl.source],
        date: newsEl.date,
        guid: generateUid(newsEl)
      };
    }).forEach(feedItem => feed.item(feedItem));

    res.set('Content-Type', 'application/rss+xml');
    //res.set('Content-Disposition', 'attachment;filename="spluseins.ics"');
    res.set('Cache-Control', `public, max-age=${CACHE_SECONDS}`);
    res.send(feed.xml());
  } catch (error) {
    next(error);
  }
});

/**
 * Get ostfalia faculty news
 * @returns NewsElement[]
 */
router.get('/:faculties', async (req, res) => {
  const faculties = <string[]>req.params.faculties.split(',');
  let limit = parseInt(req.query.limit) || MAX_NEWS_ITEMS;
  if (limit > MAX_NEWS_ITEMS) limit = MAX_NEWS_ITEMS;

  try {
    const news = await getNews(faculties, limit);
    res.set('Cache-Control', `public, max-age=${CACHE_SECONDS}`);
    res.json(news);
  } catch (error) {
    res.status(404).send(error.message);
    console.log(`Error while fetching news ${error.message}`)
  }
});

export default router;
