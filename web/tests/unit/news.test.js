import { describe, expect, it } from 'vitest';
import { ostfaliaNewsPath, recentNews } from '../../src/lib/news';

describe('news', () => {
  it('requests the news of the faculty with the central news', () => {
    expect(ostfaliaNewsPath('Recht')).toBe('/api/news/campus,r');
  });

  it('requests only the central news for faculties without news', () => {
    expect(ostfaliaNewsPath('Informatik')).toBe('/api/news/campus');
    expect(ostfaliaNewsPath(undefined)).toBe('/api/news/campus');
  });

  it('drops news older than two weeks and limits the count', () => {
    const now = new Date('2026-11-19T12:00:00Z');
    const news = [
      { title: 'a', date: '2026-11-18T00:00:00.000Z' },
      { title: 'b', date: '2026-11-10T00:00:00.000Z' },
      { title: 'c', date: '2026-11-08T00:00:00.000Z' },
      { title: 'd', date: '2026-10-01T00:00:00.000Z' },
      { title: 'e' },
    ];
    expect(recentNews(news, 2, now).map(({ title }) => title)).toEqual([
      'a',
      'b',
    ]);
    expect(recentNews(news, 10, now).map(({ title }) => title)).toEqual([
      'a',
      'b',
      'c',
    ]);
  });
});
