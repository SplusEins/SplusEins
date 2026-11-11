// Stores the results of slow requests (e.g. to the Ostfalia servers) as
// JSON files, so that the next request for the same data is answered quickly.
import { createHash } from 'crypto';
import { mkdir, readdir, readFile, rename, rm, writeFile } from 'fs/promises';
import { join } from 'path';
import { config } from '../config';

const CLEANUP_INTERVAL_MILLISECONDS = 60 * 60 * 1000;

interface CacheEntry {
  /* timestamp in milliseconds */
  expires: number;
  value: unknown;
}

/* requests which are running right now, so that the same data is never loaded twice at once */
const running = new Map<string, Promise<unknown>>();

function fileOf(key: string): string {
  // hash the key because it may contain characters which are not allowed in file names
  const name = createHash('sha1').update(key).digest('hex');
  return join(config.cachePath, name + '.json');
}

async function readEntry(file: string): Promise<CacheEntry | undefined> {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch {
    // not cached yet or the file is broken
    return undefined;
  }
}

async function writeEntry(file: string, entry: CacheEntry): Promise<void> {
  try {
    await mkdir(config.cachePath, { recursive: true });
    // write to a temporary file first so that nobody reads a half written file
    const temporaryFile = `${file}.${process.pid}.tmp`;
    await writeFile(temporaryFile, JSON.stringify(entry));
    await rename(temporaryFile, file);
  } catch (error) {
    // the cache is optional - the request must not fail because of it
    console.error('could not write cache file', file, error);
  }
}

/**
 * Return the cached value for the key. If there is none (or it is too old),
 * call `load` and cache its result. If `load` fails, nothing is cached.
 *
 * Note: Values are always returned as they were converted to JSON and back,
 * so Dates are returned as strings, whether they were cached or not.
 *
 * @param key unique name of the data
 * @param ttlSeconds how long the value may be used
 * @param load function which loads the data
 */
export async function cached<T>(
  key: string,
  ttlSeconds: number,
  load: () => Promise<T>,
): Promise<T> {
  if (config.cacheDisable) {
    return asJson(await load());
  }

  if (!running.has(key)) {
    const request = (async () => {
      const file = fileOf(key);
      const entry = await readEntry(file);
      if (entry && entry.expires > Date.now()) {
        return entry.value as T;
      }

      const value = asJson(await load());
      await writeEntry(file, {
        expires: Date.now() + ttlSeconds * 1000,
        value,
      });
      return value;
    })();
    running.set(key, request);
    // also runs if the request failed
    request.then(
      () => running.delete(key),
      () => running.delete(key),
    );
  }

  return running.get(key) as Promise<T>;
}

function asJson<T>(value: T): T {
  return value === undefined ? value : JSON.parse(JSON.stringify(value));
}

/**
 * Delete expired cache files so that the cache directory does not grow forever.
 */
export async function removeExpiredCacheEntries(): Promise<void> {
  if (config.cacheDisable) {
    return;
  }
  try {
    for (const name of await readdir(config.cachePath)) {
      if (!name.endsWith('.json')) continue;
      const file = join(config.cachePath, name);
      const entry = await readEntry(file);
      if (!entry || entry.expires < Date.now()) {
        await rm(file, { force: true });
      }
    }
  } catch {
    // the cache directory does not exist yet
  }
}

/**
 * Remove expired cache files now and then every hour.
 */
export function startCacheCleanup(): void {
  removeExpiredCacheEntries();
  // unref: the timer alone does not keep the process running
  setInterval(removeExpiredCacheEntries, CLEANUP_INTERVAL_MILLISECONDS).unref();
}
