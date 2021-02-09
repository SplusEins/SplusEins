import * as cacheManager from 'cache-manager';
import * as fsStore from 'cache-manager-fs-hash';
import * as moment from 'moment';
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { URLSearchParams } from 'url';

import { NewsElement } from '../model/SplusEinsModel';

// default must be in /tmp because the rest is RO on AWS Lambda
const CACHE_PATH = process.env.CACHE_PATH || '/tmp/spluseins-cache';
const CACHE_DISABLE = !!process.env.CACHE_DISABLE;
const CACHE_SECONDS = parseInt(process.env.NEWS_CACHE_SECONDS || '1800');

const cache = CACHE_DISABLE
  ? cacheManager.caching({ store: 'memory', max: 0 })
  : cacheManager.caching({
    store: fsStore,
    options: {
      path: CACHE_PATH,
      ttl: 60,
      subdirs: true
    }
  });

/**
 * Fetch and parse ostfalia news
 * @returns NewsElement[]
 */
async function ostfaliaNewsRequest (): Promise<NewsElement[]> {
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
      body: query
    }).then((res) => res.text());

  const $ = cheerio.load(response);
  return $('article').map(function (i, article) {
    return <NewsElement> {
      title: $('a', this).text().trim(),
      link: 'https://www.ostfalia.de' + $('a', this).attr('href'),
      text: $('p', this).last().text().trim(),
      date: moment($('p', this).first().text().trim(), 'DD.MM.YY').utcOffset('+0100').toDate()
    };
  }).get();
}

/**
 * Fetch and parse campus38 news
 * @returns NewsElement[]
 */
async function campus38NewsRequest () : Promise<NewsElement[]> {
  const response = await fetch('https://www.campus38.de/newsfeed.xml').then((res) => res.text());
  const $ = cheerio.load(response, { xmlMode: true });
  return $('entry').map(function (i, article) {
    return <NewsElement> {
      title: $('title', this).text().trim(),
      link: $('link', this).attr('href'),
      text: $('summary', this).text().trim(),
      date: moment($('published', this).text().trim().split('T')[0]).utcOffset('+0100').toDate()
    };
  }).slice(0, 10).get();
}

/**
 * Get Ostfalia faculty news
 * @returns NewsElement[]
 */
async function facultyNewsRequest (faculty: string) : Promise<NewsElement[]> {
  let url;
  if (faculty.length == 1) {
    url = 'https://www.ostfalia.de/cms/de/' + faculty;
  } else {
    url = 'https://www.ostfalia.de/cms/de/campus/' + faculty;
  }
  // Faculty E hosts their news on a subpage
  if (faculty == 'e') url += '/studium'

  const response = await fetch(url).then((res) => res.text());
  const $ = cheerio.load(response);

  if (faculty == 'i') {
    return $('article .ostfalia-content table tbody td').map(function (i, td) {
      let link = $('a', this).first().attr('href');
      if (!!link && !link.startsWith('http')) {
        link = 'https://www.ostfalia.de' + link;
      } else {
        link = '';
      }

      return <NewsElement> {
        title: $(this).text().trim(),
        link,
        text: ''
      }
    }).get();
  }

  return $('article.news-campus').map(function (i, article) {
    return <NewsElement> {
      // Title is the description of the first link
      title: $('a', this).first().text().trim(),
      // Convert relative link into absolute
      link: 'https://www.ostfalia.de' + $('a', this).first().attr('href'),
      // Get paragraphs that are not empty but exclude the first paragraph because it contains the date
      text: $('p', this).filter(function (i, el) { return ($(this).text().trim() != '' && i != 0) }).text().trim(),
      // Convert date string (like "21.09.2020") into Date object
      date: moment($('p', this).first().text().trim(), 'DD.MM.YY').utcOffset('+0100').toDate()
    };
  }).get();
}

/**
 * Manages campus news requests
 *
 * @returns NewsElement[]
 */
export function getCampusNews () {
  const key = 'campus-news';

  return cache.wrap(key, async () => {
    console.log('campus news cache miss');

    const campus38News = await campus38NewsRequest()
    const ostfaliaNews = await ostfaliaNewsRequest();

    const truncateArticle = (article) => {
      const sentences = article.text.split('.');
      const text = sentences.reduce((text, sentence) => text.length < 50 ? text + sentence + '.' : text, '');
      return {
        ...article,
        text
      };
    };

    const articles = [].concat(
      ostfaliaNews.map((article) => ({ ...article, source: 'Ostfalia' })),
      campus38News.map((article) => ({ ...article, source: 'Campus 38' }))
    ).map(truncateArticle);

    const scoreArticle = (article) => {
      const date = new Date(article.date).getTime();
      const now = new Date().getTime();
      const age = now - date;
      const boost = article.source == 'Ostfalia' ? 3.0 : 1.0;
      return age / boost;
    };

    return articles.sort((a1, a2) => scoreArticle(a1) - scoreArticle(a2));
  }, { ttl: CACHE_SECONDS }) as Promise<NewsElement[]>;
}

/**
 * Manages faculty news requests
 *
 * @param requested faculty
 * @returns NewsElement[]
 */
export function getFacultyNews (faculty: string) {
  const key = 'faculty-news-' + faculty;

  return cache.wrap(key, async () => {
    console.log(`faculty news cache miss for faculty: ${faculty}`);
    return (await facultyNewsRequest(faculty)).map((article) => ({ ...article, source: faculty }));
  }, { ttl: CACHE_SECONDS }) as Promise<NewsElement[]>;
}
