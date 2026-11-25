import express from 'express';
import { config } from '../config';
import RSS from 'rss';
import { getNews } from '../lib/NewsApi';
import { shortHash } from '../lib/shortHash';
import type { NewsElement } from '../model/api';

const CACHE_SECONDS = config.newsCacheSeconds;
const router = express.Router();

const MAX_NEWS_ITEMS = 100;

/**
 * Get ostfalia faculty news
 * @returns NewsElement[]
 */
router.get('/:newstypes{.:ext}', async (req, res) => {
  const newstypes = req.params.newstypes.split(',');
  const { limit: limitParam } = req.query;
  let limit =
    (typeof limitParam === 'string' && parseInt(limitParam)) || MAX_NEWS_ITEMS;
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
        categories: newsEl.source ? [newsEl.source] : [],
        date: newsEl.date ?? new Date(),
        guid: shortHash(newsEl.title + newsEl.date, 8),
      }))
      .forEach((feedItem) => feed.item(feedItem));
    res.set('Content-Type', 'application/rss+xml');
    return res.send(feed.xml());
  }
});

export default router;
