import * as cheerio from 'cheerio';

import { config } from '../config';
import dayjs from './dayjs';
import { cached } from './cache';
import { NewsElement } from '../model/SplusEinsModel';
import { isRecord } from './isRecord';

const CACHE_SECONDS = config.newsCacheSeconds;

const OSTFALIA_URL = 'https://www.ostfalia.de/';
const CENTRAL_NEWS_URL = OSTFALIA_URL + 'hochschule/nachrichten';

/**
 * Faculty news are the central news that name the faculty, as the faculty
 * pages only repeat them
 */
const FACULTIES: Record<string, string> = {
  b: 'Bau-Wasser-Boden',
  e: 'Elektro- und Informationstechnik',
  f: 'Fahrzeugtechnik',
  g: 'Gesundheitswesen',
  h: 'Handel und Soziale Arbeit',
  i: 'Informatik',
  k: 'Verkehr-Sport-Tourismus-Medien',
  m: 'Maschinenbau',
  r: 'Recht',
  s: 'Soziale Arbeit',
  v: 'Versorgungstechnik',
  w: 'Wirtschaft',
};
const SELECTORS = ['campus', 'campus38', ...Object.keys(FACULTIES)];

async function fetchOk(url: string): Promise<Response> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response;
}

/* the central news have about 10 news a week on each page */
const CENTRAL_NEWS_PAGES = 3;

/**
 * Scrape the first pages of the central news of the Ostfalia website (TYPO3)
 */
async function centralNewsRequest(): Promise<NewsElement[]> {
  const htmls = await Promise.all(
    Array.from({ length: CENTRAL_NEWS_PAGES }, async (_, i) => {
      const url = `${CENTRAL_NEWS_URL}?tx_solr%5Bpage%5D=${i + 1}`;
      return (await fetchOk(url)).text();
    }),
  );
  const $ = cheerio.load(htmls.join(''));
  const elements = $('.teaser-wall__item')
    .map((_, item): NewsElement => {
      // "Aktuelles | 20.11.2026 | Fakultät Maschinenbau, Fakultät Wirtschaft"
      const [, , departments = ''] = $('.teaser__meta', item).text().split('|');
      const href = $('.teaser__title-link', item).attr('href');
      const date = $('time.teaser__date', item).attr('datetime');
      return {
        title: $('.teaser__title-text', item).text().trim(),
        link: href ? new URL(href, OSTFALIA_URL).href : CENTRAL_NEWS_URL,
        text: $('.teaser__snippet', item).text().trim(),
        date: date ? dayjs(date).toISOString() : undefined,
        departments: departments
          .split(',')
          .map((department) => department.trim())
          .filter(Boolean),
      };
    })
    .get()
    .filter((article) => article.title);
  if (elements.length === 0) {
    throw new Error('No central news found, did the page layout change?');
  }
  return elements;
}

interface WordpressPost {
  date_gmt: string;
  link: string;
  title: { rendered: string };
  excerpt: { rendered: string };
}

function isWordpressPost(post: unknown): post is WordpressPost {
  return (
    isRecord(post) &&
    typeof post.date_gmt === 'string' &&
    typeof post.link === 'string' &&
    isRecord(post.title) &&
    typeof post.title.rendered === 'string' &&
    isRecord(post.excerpt) &&
    typeof post.excerpt.rendered === 'string'
  );
}

const htmlToText = (html: string) => cheerio.load(html).text().trim();

/**
 * Fetch campus38 news from the WordPress REST API
 */
async function campus38NewsRequest(): Promise<NewsElement[]> {
  const response = await fetchOk(
    'https://campus38.de/wp-json/wp/v2/posts?per_page=10&_fields=date_gmt,link,title,excerpt',
  );
  const posts: unknown = await response.json();
  if (!Array.isArray(posts)) {
    throw new Error('campus38 did not return a list of posts');
  }
  return posts.filter(isWordpressPost).map((post) => ({
    title: htmlToText(post.title.rendered),
    link: post.link,
    text: htmlToText(post.excerpt.rendered),
    date: new Date(post.date_gmt + 'Z').toISOString(),
  }));
}

/**
 * Helper function for cleaning news articles
 * @param news news to parse
 * @param limit Limit the news elements to this number
 * @returns filtered (no duplicates or items with future date) and sorted news articles with truncated descriptions
 */
function truncateAndSortNews(
  news: NewsElement[],
  limit: number,
): NewsElement[] {
  // don't show articles that are more than x days in the future,
  // can happen in some rare cases where news items = calendar items (like faculty S)
  news = news.filter(
    (article) => dayjs(article.date).diff(dayjs(), 'days') < 3,
  );
  // Filter any duplicate entries (based on title+desc)
  news = news.filter(
    (v, i, a) =>
      a.findIndex((t) => t.title === v.title && t.text === v.text) === i,
  );
  // filter out job adverts
  news = news.filter((article) => !article.title.includes('(m/w/d)'));

  // Truncate article descriptions
  news = news.map((article) => {
    const MAX_LEN = 130;
    let text = article.text;
    // inspired by https://stackoverflow.com/a/40382963/4026792
    if (text.length > MAX_LEN) {
      const lastDotIndex = text.lastIndexOf('.', MAX_LEN);
      if (lastDotIndex > MAX_LEN / 2)
        text = text.slice(0, lastDotIndex + 1); // cut text at end of sentence
      else text = text.slice(0, text.lastIndexOf(' ', MAX_LEN)) + '...'; // no end of sentence exists or it's too early, cut text at end of word and add ...
    }
    return {
      ...article,
      text,
    };
  });

  // newest first, news without a date last
  const time = ({ date }: NewsElement) => (date ? new Date(date).getTime() : 0);
  return news.sort((a1, a2) => time(a2) - time(a1)).slice(0, limit);
}

async function loadNews(newsSelector: string): Promise<NewsElement[]> {
  if (newsSelector === 'campus38') {
    return cached('news-campus38', CACHE_SECONDS, campus38NewsRequest);
  }
  const news = await cached('news-campus', CACHE_SECONDS, centralNewsRequest);
  const faculty = FACULTIES[newsSelector];
  return faculty
    ? news.filter(({ departments }) =>
        departments?.includes(`Fakultät ${faculty}`),
      )
    : news;
}

/**
 * Manages news requests including caching
 *
 * @param newsSelectors Array that specifies which news should be fetched
 * @param limit Maximum number of news to return
 * @returns NewsElement[] Sorted news for the specified `newsSelectors`
 */
export default async function getNews(
  newsSelectors: string[],
  limit: number,
): Promise<NewsElement[]> {
  const unknown = newsSelectors.find((s) => !SELECTORS.includes(s));
  if (unknown) throw new Error(`Selector "${unknown}" not supported`);

  const news = await Promise.all(
    newsSelectors.map(async (newsSelector) => {
      try {
        const news = await loadNews(newsSelector);
        return news.map((article) => ({ ...article, source: newsSelector }));
      } catch (e) {
        if (!(e instanceof Error)) throw e;
        console.log(
          `Error while loading news for "${newsSelector}": ${e.message}`,
        );
        return [];
      }
    }),
  );
  return truncateAndSortNews(news.flat(), limit);
}
