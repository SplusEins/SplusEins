import * as express from 'express';

import getNews from '../lib/NewsApi'

const CACHE_SECONDS = parseInt(process.env.NEWS_CACHE_SECONDS || '1800');
const router = express.Router();

/**
 * Accept CORS preflight requests.
 */
router.options('/:faculties');

/**
 * Get ostfalia faculty news
 * @returns NewsElement[]
 */
router.get('/:faculties', async (req, res) => {
  const faculties = <string[]>req.params.faculties.split(',');
  
  try {
    const facultyNews = await getNews(faculties);
    res.set('Cache-Control', `public, max-age=${CACHE_SECONDS}`);
    res.json(facultyNews);
  } catch (error) {
    res.status(404).send(error.message);
    console.log(`Error while fetching news ${error.message}`)
  }
});

export default router;
