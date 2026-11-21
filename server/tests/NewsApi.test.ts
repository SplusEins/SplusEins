import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fixture, mockFetch } from './helpers';

type NewsApi = typeof import('../lib/NewsApi');

describe('Test NewsApi', () => {
  let getNews: NewsApi['default'];
  let fetchSpy: ReturnType<typeof mockFetch>;

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-19T12:00:00Z'));
    fetchSpy = mockFetch(async (url) =>
      url.startsWith('https://campus38.de/')
        ? new Response(fixture('campus38-news.json'))
        : new Response(fixture('ostfalia-news.html')),
    );
    vi.resetModules();
    getNews = (await import('../lib/NewsApi')).default;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should scrape the Ostfalia news list', async () => {
    const news = await getNews(['campus'], 100);
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://www.ostfalia.de/hochschule/nachrichten?tx_solr%5Bpage%5D=3',
    );
    expect(news[0]).toEqual({
      title: 'Exkursion: SDGnext in Genf',
      link: 'https://www.ostfalia.de/hochschule/fakultaeten/fakultaet-recht/nachrichten/nachricht/18-11-2026_exkursion-sdgnext-in-genf',
      text: 'Masterstudierende aus Deutschland und der Schweiz verhandeln die Nachhaltigkeitsziele nach 2030',
      date: new Date(2026, 10, 18).toISOString(),
      source: 'campus',
      departments: ['Fakultät Recht'],
    });
    expect(
      news.every(({ link }) =>
        link.startsWith('https://www.ostfalia.de/hochschule/'),
      ),
    ).toBe(true);
  });

  it('should read who published the Ostfalia news', async () => {
    const departments = (await getNews(['campus'], 100)).map(
      ({ departments }) => departments,
    );
    expect(departments).toContainEqual(['Marketing und Kommunikation']);
    expect(departments).toContainEqual([]);
  });

  it('should resolve relative Ostfalia links without leading slash', async () => {
    const news = await getNews(['campus'], 100);
    expect(news).toHaveLength(10);
    expect(news.map(({ link }) => link)).toContain(
      'https://www.ostfalia.de/hochschule/fakultaeten/handel-und-soziale-arbeit/nachrichten/nachricht/11-11-2026_studierende-des-bachelorstudiengangs-bwl-und-management-auf-exkursion',
    );
  });

  it('should load campus38 news from the WordPress API', async () => {
    const news = await getNews(['campus38'], 100);
    expect(news).toHaveLength(10);
    expect(news[0]).toEqual({
      title: 'Aus Gedanken werden Worte',
      link: 'https://campus38.de/aus-gedanken-werden-worte/',
      text: expect.stringMatching(/^Poetry Slam lebt von Geschichten/),
      date: '2026-11-18T19:05:00.000Z',
      source: 'campus38',
    });
  });

  it('should decode HTML entities in campus38 texts', async () => {
    const news = await getNews(['campus38'], 100);
    const texts = news.map(({ title, text }) => title + text).join();
    expect(texts).not.toMatch(/&#?\w+;/);
  });

  it('should take the news of a faculty from the central news', async () => {
    const news = await getNews(['r'], 100);
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://www.ostfalia.de/hochschule/nachrichten?tx_solr%5Bpage%5D=1',
    );
    expect(news).toHaveLength(2);
    expect(news.map(({ departments }) => departments)).toEqual([
      ['Fakultät Recht'],
      ['Fakultät Recht'],
    ]);
    expect(news[0].source).toBe('r');
  });

  it('should return no news if the page layout changed', async () => {
    fetchSpy.mockImplementation(async () => new Response('<html></html>'));
    expect(await getNews(['r'], 100)).toEqual([]);
  });

  it('should reject unknown selectors', async () => {
    await expect(getNews(['x'], 100)).rejects.toThrow('not supported');
    await expect(getNews(['wob'], 100)).rejects.toThrow('not supported');
  });

  it('should sort the news of all sources by date', async () => {
    const news = await getNews(['campus', 'campus38'], 100);
    const dates = news.map(({ date }) => new Date(date!).getTime());
    expect(dates).toEqual([...dates].sort((a, b) => b - a));
    expect(news[0].source).toBe('campus38');
  });

  it('should return at most limit news', async () => {
    expect(await getNews(['campus', 'campus38'], 3)).toHaveLength(3);
  });
});
