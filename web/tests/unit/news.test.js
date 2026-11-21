import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { departmentLabel, recentNews } from '../../src/lib/news';

const titles = (news) => news.map(({ title }) => title);

describe('news', () => {
  beforeEach(() => vi.setSystemTime(new Date('2026-11-19T12:00:00Z')));
  afterEach(() => vi.useRealTimers());

  it('drops news older than two weeks and limits the count', () => {
    const news = [
      { title: 'a', date: '2026-11-18T00:00:00.000Z' },
      { title: 'b', date: '2026-11-10T00:00:00.000Z' },
      { title: 'c', date: '2026-11-08T00:00:00.000Z' },
      { title: 'd', date: '2026-10-01T00:00:00.000Z' },
      { title: 'e' },
    ];
    expect(titles(recentNews(news, 2))).toEqual(['a', 'b']);
    expect(titles(recentNews(news, 10))).toEqual(['a', 'b', 'c']);
  });

  it('prefers up to three news of the departments, in date order', () => {
    const news = ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((title, i) => ({
      title,
      date: `2026-11-${18 - i}T00:00:00.000Z`,
      departments: 'cdefg'.includes(title) ? ['Fakultät Recht'] : [],
    }));
    expect(titles(recentNews(news, 5, ['Fakultät Recht']))).toEqual([
      'a',
      'b',
      'c',
      'd',
      'e',
    ]);
    expect(titles(recentNews(news, 4, ['Fakultät Recht']))).toEqual([
      'a',
      'c',
      'd',
      'e',
    ]);
  });

  it('shortens department names', () => {
    expect(departmentLabel('Fakultät Recht')).toBe('Recht');
    expect(departmentLabel('Sprachenzentrum')).toBe('Sprachenzentrum');
    expect(
      departmentLabel('Zentrum für erfolgreiches Lehren und Lernen (ZeLL)'),
    ).toBe('ZeLL');
    expect(
      departmentLabel(
        'Institut für nachhaltige Bewässerung und Wasserwirtschaft im ländlichen Raum',
      ),
    ).toBe('Institut für nachhaltige Bewäs…');
  });
});
