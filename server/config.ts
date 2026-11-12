// All settings of the API server, read from environment variables.
// See docs/src/konfiguration.md for a description of each variable.

function text(name: string): string | undefined {
  const value = process.env[name];
  return value === '' ? undefined : value;
}

function flag(name: string): boolean {
  return !!text(name);
}

function number(name: string, defaultValue: number): number {
  const value = text(name);
  if (value === undefined) {
    return defaultValue;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${name} must be a positive number, got "${value}"`);
  }
  return parsed;
}

export const config = {
  host: text('HOST') ?? '127.0.0.1',
  port: number('PORT', 3001),
  apiPrefix: text('API_PREFIX') ?? '/api',

  skedUser: text('SKED_USER'),
  skedPassword: text('SKED_PASSWORD'),
  censorDisable: flag('CENSOR_DISABLE'),

  // default must be in /tmp because the rest is RO on AWS Lambda
  cachePath: text('CACHE_PATH') ?? '/tmp/spluseins-cache',
  cacheDisable: flag('CACHE_DISABLE'),
  splusCacheSeconds: number('SPLUS_CACHE_SECONDS', 10800),
  mensaCacheSeconds: number('MENSA_CACHE_SECONDS', 1800),
  newsCacheSeconds: number('NEWS_CACHE_SECONDS', 1800),
  busCacheSeconds: number('BUS_CACHE_SECONDS', 60),
  icsCacheSeconds: number('ICS_CACHE_SECONDS', 600),
  icsPreloadWeeks: number('ICS_PRELOAD_WEEKS', 4),
};
