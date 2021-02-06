import * as express from 'express';

import { getCampusNews, getFacultyNews } from '../lib/NewsApi'

const CACHE_SECONDS = parseInt(process.env.NEWS_CACHE_SECONDS || '1800');
const router = express.Router();

const flatten = <T>(arr: T[][]) => [].concat(...arr) as T[];

/**
 * Accept CORS preflight requests.
 */
router.options('/campus');
router.options('/:faculties');

/**
 * Get campus news
 * @returns NewsElement[]
 */
router.get('/campus', async (req, res, next) => {
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
router.get('/:faculties', async (req, res, next) => {
  let faculties = <string[]>req.params.faculties.split(',');
  if (faculties.length == 1 && faculties[0] == "faculty"){
    // for backward compatibility only, if request was /api/news/faculty
    faculties = ['i', 'r', 'e', 'wf', 'wob', 'sud'];
  }
  
  try {
    let facultyNews = await Promise.all(
      faculties.map(async (faculty) => {
        try {
          return await getFacultyNews(faculty);
        } catch (e) {
          console.log(`Error while loading faculty news for "${faculty}": ${e.message}`)
          return [];
        }
      })
    ).then(flatten)
    const sortByDate = (a1, a2) => {
      const date1 = new Date(a1.date).getTime();
      const date2 = new Date(a2.date).getTime();
      return date2 - date1;
    };
    facultyNews = facultyNews.sort(sortByDate);
    res.set('Cache-Control', `public, max-age=${CACHE_SECONDS}`);
    res.json(facultyNews);
  } catch (error) {
    next(error);
  }
});

export default router;
