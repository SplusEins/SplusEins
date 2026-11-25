import dayjs from './dayjs';
import { truncateText } from './util';
import type { NewsElement } from '../types';

const MAX_NEWS_AGE_DAYS = 14;
/* the rest of the news are the newest of all departments */
const MAX_FACULTY_NEWS_FIRST = 3;

/**
 * @param departments whose news are preferred, e.g. ['Fakultät Recht']
 * @returns the newest `count` news which are at most MAX_NEWS_AGE_DAYS old,
 *   with up to 3 news of the departments among them, in their order
 */
export function recentNews(
  news: NewsElement[],
  count: number,
  departments: string[] = [],
): NewsElement[] {
  const oldest = dayjs().subtract(MAX_NEWS_AGE_DAYS, 'days');
  const recent = news.filter(({ date }) => date && dayjs(date).isAfter(oldest));
  const shown = new Set(
    recent
      .filter((item) =>
        item.departments?.some((name) => departments.includes(name)),
      )
      .slice(0, MAX_FACULTY_NEWS_FIRST),
  );
  for (const item of recent) if (shown.size < count) shown.add(item);
  return recent.filter((item) => shown.has(item));
}

/* e.g. 'Recht' for 'Fakultät Recht', 'ZeLL' for 'Zentrum für … (ZeLL)' */
export function departmentLabel(department: string): string {
  const abbreviation = department.match(/\((.+)\)$/)?.[1];
  return abbreviation ?? truncateText(department.replace(/^Fakultät /, ''), 30);
}
