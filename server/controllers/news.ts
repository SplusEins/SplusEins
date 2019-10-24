import * as express from 'express';
import * as cors from 'cors';

import { getCampusNews, getFacultyNews } from '../lib/NewsApi'

const CACHE_SECONDS = parseInt(process.env.NEWS_CACHE_SECONDS || '1800');
const router = express.Router();

const flatten = <T>(arr: T[][]) => [].concat(...arr) as T[];

/**
 * Accept CORS preflight requests.
 */
router.options('/campus', cors());
router.options('/faculty', cors());

/**
 * Get campus news
 * @returns NewsElement[]
 */
router.get('/campus', cors(), async (req, res, next) => {
  try {
    const campusNews = await getCampusNews();
    res.set('Cache-Control', `public, max-age=${CACHE_SECONDS}`);
    res.json(campusNews);
  } catch (error) {
    next(error);
  }
});

/**
 * Get ostfalia faculty news
 * @returns NewsElement[]
 */
router.get('/faculty', cors(), async (req, res, next) => {

  // Informatik, Recht, Elektrotechnik,
  // Wolfenbüttel, Wolfsburg, Suderburg
  const faculties = ['i', 'r', 'e', 'wf', 'wob', 'sud'];
    
  try {
    const facultyNews = await Promise.all(
      faculties.map(async (faculty) => {
        try{
          return await getFacultyNews(faculty);
        } catch {
          console.log(`Error while loading faculty news for key: ${faculty}`)
        }
      })
    ).then(flatten);
    res.set('Cache-Control', `public, max-age=${CACHE_SECONDS}`);
    res.json(facultyNews);
  } catch (error) {
    next(error);
  }
});

export default router;
