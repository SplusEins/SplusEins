import { defineConfig } from 'vitest/config';

// https://vitest.dev/config/
export default defineConfig({
  test: {
    include: ['tests/**/*.{test,spec}.ts'],
    env: {
      // The Ostfalia uses german time. Tests run in another time zone to make
      // sure that the result does not depend on the time zone of the server.
      TZ: 'America/New_York',
      // Tests must not depend on the cache of earlier runs, see tests/cache.test.ts for the cache itself.
      CACHE_DISABLE: 'true',
    },
  },
});
