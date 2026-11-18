import dayjs from './dayjs';

/* faculty names of the timetables with their news selector of the API */
const FACULTY_SELECTORS = {
  'Bau-Wasser-Boden': 'b',
  Gesundheitswesen: 'g',
  'Handel und Soziale Arbeit': 'h',
  'Verkehr-Sport-Tourismus-Medien': 'k',
  Maschinenbau: 'm',
  Recht: 'r',
  'Soziale Arbeit': 's',
  Versorgungstechnik: 'v',
};

export const MAX_NEWS_AGE_DAYS = 14;

/**
 * @param faculty faculty name of a timetable, e.g. 'Recht'
 * @returns API path for the central Ostfalia news and the news of the faculty
 */
export function ostfaliaNewsPath(faculty) {
  const selectors = ['campus', FACULTY_SELECTORS[faculty]].filter(Boolean);
  return `/api/news/${selectors.join(',')}`;
}

/**
 * @returns the newest `count` news which are at most MAX_NEWS_AGE_DAYS old
 */
export function recentNews(news, count, now = dayjs()) {
  const oldest = dayjs(now).subtract(MAX_NEWS_AGE_DAYS, 'days');
  return news
    .filter(({ date }) => date && dayjs(date).isAfter(oldest))
    .slice(0, count);
}
