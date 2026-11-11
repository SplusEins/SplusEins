import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

type CacheModule = typeof import('../lib/cache');

describe('Test cache', () => {
  let cachePath: string;
  let cache: CacheModule;

  beforeEach(async () => {
    cachePath = mkdtempSync(join(tmpdir(), 'spluseins-cache-'));
    process.env.CACHE_PATH = cachePath;
    process.env.CACHE_DISABLE = '';
    // the configuration is read when the module is loaded
    vi.resetModules();
    cache = await import('../lib/cache');
  });

  afterEach(() => {
    rmSync(cachePath, { recursive: true, force: true });
    process.env.CACHE_DISABLE = 'true';
  });

  const value = { start: new Date('2026-11-09T07:15:00Z'), title: 'Test' };

  it('should return the same shape on a miss and on a hit', async () => {
    const miss = await cache.cached('key', 60, async () => value);
    const hit = await cache.cached('key', 60, async () => value);
    expect(miss).toEqual({ start: '2026-11-09T07:15:00.000Z', title: 'Test' });
    expect(hit).toEqual(miss);
  });

  it('should load the data only once for concurrent calls', async () => {
    const load = vi.fn(async () => value);
    await Promise.all([
      cache.cached('key', 60, load),
      cache.cached('key', 60, load),
    ]);
    await cache.cached('key', 60, load);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('should reload expired entries', async () => {
    const load = vi.fn(async () => value);
    await cache.cached('key', 0, load);
    await cache.cached('key', 0, load);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('should not cache failed loads', async () => {
    await expect(
      cache.cached('key', 60, async () => {
        throw new Error('Sked is down');
      }),
    ).rejects.toThrow('Sked is down');
    await expect(cache.cached('key', 60, async () => value)).resolves.toEqual(
      expect.objectContaining({ title: 'Test' }),
    );
  });

  it('should ignore broken cache files', async () => {
    await cache.cached('key', 60, async () => value);
    const [file] = readdirSync(cachePath);
    writeFileSync(join(cachePath, file), '{broken');
    await expect(
      cache.cached('key', 60, async () => ({ title: 'new' })),
    ).resolves.toEqual({ title: 'new' });
  });

  it('should remove only expired files', async () => {
    await cache.cached('expired', -1, async () => value);
    const [expiredFile] = readdirSync(cachePath);
    await cache.cached('fresh', 60, async () => value);

    await cache.removeExpiredCacheEntries();

    expect(readdirSync(cachePath)).toHaveLength(1);
    expect(readdirSync(cachePath)).not.toContain(expiredFile);
  });

  it('should not write files if the cache is disabled', async () => {
    process.env.CACHE_DISABLE = 'true';
    vi.resetModules();
    cache = await import('../lib/cache');
    const load = vi.fn(async () => value);

    await cache.cached('key', 60, load);
    await cache.cached('key', 60, load);

    expect(load).toHaveBeenCalledTimes(2);
    expect(readdirSync(cachePath)).toEqual([]);
  });
});
