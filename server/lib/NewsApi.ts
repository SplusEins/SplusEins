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

const flatten = <T>(arr: T[][]) => [].concat(...arr) as T[];

/**
 * Fetch and parse ostfalia news from internal ostfalia endpoint they use for openCMS
 * 
 * @param newsSelector News type to load
 * @returns NewsElement[]
 */
async function ostfaliaNewsRequest(newsSelector: string): Promise<NewsElement[]> {
  if (['wob', 'wf', 'sud', 'sz'].includes(newsSelector)) {
    // prepend standort/campus selectors with necceassary prefix
    newsSelector = "campus/" + newsSelector;
  }
  const query = new URLSearchParams();
  query.append('itemsPerPage', '10');
  // Syntax of collectorParam very similar to https://documentation.opencms.org/opencms-documentation/more-opencms-features/solr-search-integration
  // so that param will probably be forwarded to Apache SOLR
  query.append('collectorParam',
    'fq=type:of-news' + // not stricly neccessary, but kept here just in case
    '&fq=parent-folders:"/sites/default/de/' + newsSelector + '/.content/"' + // .content could be removed as well
    '&sort=newsdate_de_dt desc' + // order the articles by date in the SOLR requests
    '&rows=25'); // limit the number of requested rows, otherwise server error
  query.append('showDate', 'true'); // always show dates on articles
  query.append('currPage', '1'); // pagination, we always need the first page
  query.append('teaserLength', '150'); // cut off descriptions longer than x characters, doesn't always work?

  const response = await fetch(
    'https://www.ostfalia.de/cms/system/modules/de.ostfalia.module.template/elements/renderNewsList.jsp', {
    method: 'POST',
    body: query,
  }).then((res) => res.text());

  const $ = cheerio.load(response);
  const elements: NewsElement[] = await $('article').map(function () {
    return <NewsElement>{
      title: $('a', this).text().trim(),
      link: 'https://www.ostfalia.de' + $('a', this).attr('href'),
      text: $('p', this).last().text().trim(),
      date: moment($('p', this).first().text().trim(), 'DD.MM.YY').utcOffset('+0100').toDate()
    };
  }).get();
  console.log(`Fetched ${elements.length} news for "${newsSelector}"`)
  return elements;
}

/**
 * Fetch and parse campus38 news
 * @returns NewsElement[]
 */
async function campus38NewsRequest(): Promise<NewsElement[]> {
  const response = await fetch('https://www.campus38.de/newsfeed.xml').then((res) => res.text());
  const $ = cheerio.load(response, { xmlMode: true });
  return $('entry').map(function () {
    return <NewsElement>{
      title: $('title', this).text().trim(),
      link: $('link', this).attr('href'),
      text: $('summary', this).text().trim(),
      date: moment($('published', this).text().trim().split('T')[0]).utcOffset('+0100').toDate()
    };
  }).slice(0, 10).get();
}

/**
 * Helper function for cleaning news articles
 * @param news news to parse
 * @returns filtered and sorted news articles with truncated descriptions
 */
function truncateAndSortNews(news: NewsElement[]): NewsElement[] {
  // don't show articles that are more than x days in the future, 
  // can happen in some rare cases where news items = calendar items (like faculty S)
  news = news.filter(article => (moment(article.date).diff(moment(), 'days') < 3))

  // Truncate article descriptions
  const truncateArticle = (article: NewsElement) => {
    if (article.text.length == 0) {
      return article;
    }
    const sentences = article.text.split('.');
    let text = sentences.reduce((text, sentence) => text.length < 80 ? text + sentence + '.' : text, '');
    if (text.length > 250) {
      // hard cut-off in case the sentence was longer than expected
      text = text.slice(0, 250) + "...";
    }
    return {
      ...article,
      text,
    };
  };
  news = news.map(truncateArticle);

  // Sort articles by date, but rank "campus38" lower because they have much more news
  const scoreArticle = (article: NewsElement) => {
    const date = new Date(article.date).getTime();
    const now = new Date().getTime();
    const age = now - date;
    const boost = article.source == 'campus38' ? 0.35 : 1.0;
    return age / boost;
  };
  return news.sort((a1, a2) => scoreArticle(a1) - scoreArticle(a2));
}

/**
 * Manages news requests
 *
 * @param newsSelectors faculty
 * @returns NewsElement[]
 */
export default async function getNews(newsSelectors: string[]): Promise<NewsElement[]> {
  const facultySelectors = ['r', 'v', 'm', 'b', 'k', 'h', 'f', 'g', 'w', 'e', 's']; // all allowed faculties
  const campusSelectors = ['wob', 'wf', 'sud', 'sz']; // all allowed campuses/standorte
  const otherSelectors = ['campus', 'campus38']; // currently only ostfalia global news and Campus 38 news.
  const allowedSelectors = facultySelectors.concat(campusSelectors, otherSelectors);

  const facultyNews = await Promise.all(
    newsSelectors.map(async (newsSelector) => {
      if (!allowedSelectors.includes(newsSelector)) {
        throw new Error(`Selector "${newsSelector}" not supported`);
      }
      try {
        const key = 'faculty-news-' + newsSelector;
        return await cache.wrap(key, async () => {
          let newsEls: NewsElement[] = newsSelector != 'campus38' ?
            await ostfaliaNewsRequest(newsSelector) : await campus38NewsRequest();
          newsEls = newsEls.map((article) => ({ ...article, source: newsSelector }));
          return newsEls;
        }, { ttl: CACHE_SECONDS }) as Promise<NewsElement[]>;
      } catch (e) {
        console.log(`Error while loading faculty news for "${newsSelector}": ${e.message}`)
        return [];
      }
    })
  ).then(flatten);
  return truncateAndSortNews(facultyNews);
}
