import * as cheerio from 'cheerio';

import { config } from '../config';
import dayjs from './dayjs';
import { cached } from './cache';
import { NewsElement } from '../model/SplusEinsModel';

const CACHE_SECONDS = config.newsCacheSeconds;

const OSTFALIA_URL = 'https://www.ostfalia.de/';
const FACULTIES = 'hochschule/fakultaeten/';

/**
 * News list pages of the Ostfalia website. Selectors without a page there
 * (e, f, w and the campuses) are still accepted but return no news.
 */
const OSTFALIA_NEWS_PAGES: Record<string, string | undefined> = {
  campus: 'hochschule/nachrichten',
  b: FACULTIES + 'fakultaet-bau-wasser-boden/nachrichten',
  g: FACULTIES + 'fakultaet-gesundheitswesen/nachrichten',
  h: FACULTIES + 'handel-und-soziale-arbeit/nachrichten',
  k: FACULTIES + 'fakultaet-verkehr-sport-tourismus-medien/nachrichten',
  m: FACULTIES + 'fakultaet-maschinenbau/nachrichten',
  r: FACULTIES + 'fakultaet-recht/nachrichten',
  s: FACULTIES + 'fakultaet-soziale-arbeit/nachrichten',
  v: FACULTIES + 'fakultaet-versorgungstechnik/nachrichten',
  e: undefined,
  f: undefined,
  w: undefined,
  wob: undefined,
  wf: undefined,
  sud: undefined,
  sz: undefined,
};

async function fetchOk(url: string): Promise<Response> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response;
}

/**
 * Scrape the news list page of the Ostfalia website (TYPO3)
 */
async function ostfaliaNewsRequest(
  newsSelector: string,
): Promise<NewsElement[]> {
  const page = OSTFALIA_NEWS_PAGES[newsSelector];
  if (!page) return [];
  const response = await fetchOk(OSTFALIA_URL + page);
  const $ = cheerio.load(await response.text());
  const elements = $('.teaser-wall__item')
    .map((_, item) => {
      const href = $('.teaser__title-link', item).attr('href');
      const date = $('time.teaser__date', item).attr('datetime');
      return <NewsElement>{
        title: $('.teaser__title-text', item).text().trim(),
        link: href ? new URL(href, OSTFALIA_URL).href : OSTFALIA_URL + page,
        text: $('.teaser__snippet', item).text().trim(),
        date: date ? dayjs(date).toDate() : undefined,
      };
    })
    .get()
    .filter((article) => article.title);
  if (elements.length === 0) {
    throw new Error(`No news found on ${page}, did the page layout change?`);
  }
  return elements;
}

interface WordpressPost {
  date_gmt: string;
  link: string;
  title: { rendered: string };
  excerpt: { rendered: string };
}

const htmlToText = (html: string) => cheerio.load(html).text().trim();

/**
 * Fetch campus38 news from the WordPress REST API
 */
async function campus38NewsRequest(): Promise<NewsElement[]> {
  const response = await fetchOk(
    'https://campus38.de/wp-json/wp/v2/posts?per_page=10&_fields=date_gmt,link,title,excerpt',
  );
  const posts = (await response.json()) as WordpressPost[];
  return posts.map((post) => ({
    title: htmlToText(post.title.rendered),
    link: post.link,
    text: htmlToText(post.excerpt.rendered),
    date: new Date(post.date_gmt + 'Z'),
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
  const allowedSelectors = [...Object.keys(OSTFALIA_NEWS_PAGES), 'campus38'];

  const news = await Promise.all(
    newsSelectors.map(async (newsSelector) => {
      if (!allowedSelectors.includes(newsSelector)) {
        throw new Error(`Selector "${newsSelector}" not supported`);
      }
      try {
        const key = 'news-' + newsSelector;
        return await cached(key, CACHE_SECONDS, async () => {
          let newsEls: NewsElement[] =
            newsSelector !== 'campus38'
              ? await ostfaliaNewsRequest(newsSelector)
              : await campus38NewsRequest();
          newsEls = newsEls.map((article) => ({
            ...article,
            source: newsSelector,
          }));
          return newsEls;
        });
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
