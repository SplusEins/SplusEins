/* eslint-disable no-useless-escape */
import * as express from 'express';
import * as RSS from 'rss';
import {} from 'rss';
import getNews from '../lib/NewsApi';
import { NewsElement } from '~/model/SplusEinsModel';
import * as crypto from 'crypto';

const CACHE_SECONDS = parseInt(process.env.NEWS_CACHE_SECONDS || '1800');
const router = express.Router();

const MAX_NEWS_ITEMS = 100;

/**
 * Accept CORS preflight requests.
 */
router.options('/:newstypes\.:ext?');

/**
 * Get ostfalia faculty news
 * @returns NewsElement[]
 */
router.get('/:newstypes\.:ext?', async (req, res) => {
  const newstypes = <string[]>req.params.newstypes.split(',');
  let limit = parseInt(req.query.limit as string) || MAX_NEWS_ITEMS;
  if (limit > MAX_NEWS_ITEMS) limit = MAX_NEWS_ITEMS;
  let news: NewsElement[];
  try {
    news = await getNews(newstypes, limit);
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    console.log(`Error while fetching news: ${error.message}`);
    return res.status(404).send(error.message);
  }
  res.set('Cache-Control', `public, max-age=${CACHE_SECONDS}`);
  if (req.params.ext !== 'rss') {
    // Normal request, send news as JSON
    return res.json(news);
  } else {
    // Request ends with .rss, create and send RSS feed
    const news = await getNews(newstypes, limit);
    const hostUrl = req.protocol + '://' + req.get('host');
    const feed = new RSS({
      title: `SplusEins news feed (for ${req.params.newstypes})`,
      feed_url: hostUrl + req.originalUrl,
      site_url: hostUrl,
    });
    // Map news items to rss feed items
    news
      .map((newsEl: NewsElement) => ({
        title: newsEl.title,
        description: newsEl.text,
        url: newsEl.link,
        categories: [newsEl.source],
        date: newsEl.date,
        guid: crypto
          .createHash('sha1')
          .update(newsEl.title + newsEl.date)
          .digest('base64')
          .replace(/\W/g, '')
          .slice(0, 8),
      }))
      .forEach((feedItem) => feed.item(feedItem));
    res.set('Content-Type', 'application/rss+xml');
    return res.send(feed.xml());
  }
});

export default router;
