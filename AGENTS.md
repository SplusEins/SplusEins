# AGENTS.md

Guidance for coding agents working in this repository.

## Structure

Three independent npm packages, each with its own `package.json`, `.nvmrc` (Node 24) and ESLint/Prettier config. There is no root `package.json`, so `cd` into one first.

- `server/`: Express 5 API in TypeScript, served at `/api`
- `web/`: Vue 3 SPA (Vite, Vuetify, Pinia, PWA) in JavaScript; new code may use TypeScript
- `docs/`: VitePress docs in German, served at `/docs`. `konfiguration.md` documents every env var, `server.md` the API, `deployment.md` the Dokku setup.
- `app/`: generated Android TWA wrapper, not maintained by hand

Each package is its own Dokku app (`.dokku-monorepo`). `deploy.yml` deploys all of them on push to `master`, `deploy-dev.yml` deploys the staging apps on demand.

## Commands

```bash
# server/
npm run dev          # API at 127.0.0.1:3001/api, loads server/.env (SKED_USER, SKED_PASSWORD)
npm run typecheck    # tsc, including tests
npm run build        # tsc -p tsconfig.build.json -> dist/
npx vitest run tests/SkedParser.test.ts   # single file
npx vitest run -u    # update parser snapshots after an intended parser change

# web/
npm run dev:remote   # Vite on :3000 against https://spluseins.de/api
npm run dev:local    # against a local server/
npm run typecheck    # vue-tsc, checks TypeScript only (checkJs is off)

# every package
npm test / lint / lintfix / fmt / fmt:check
```

CI runs server `lint, fmt:check, typecheck, build, test` and web `lint, fmt:check, typecheck, test, build`. Run the same before pushing.

Server tests mock `fetch` with fixtures from `server/tests/fixtures/`, so they need no Ostfalia credentials. `vitest.config.ts` sets `TZ=America/New_York` so results cannot depend on the server time zone, and `CACHE_DISABLE=true`.

## Timetables

`timetable-config.yaml` is the input of the external Python tool [sked-parser](https://github.com/SplusEins/sked_parser), not of code in this repo. The daily `timetables.yml` workflow runs it and opens a PR that regenerates `server/assets/timetables.json` and `web/src/assets/timetables.json`. Never edit those by hand.

A plan request goes `controllers/splus.ts` -> `lib/SplusApi.ts` (fetches from Ostfalia with Basic Auth, retries 5xx) -> `lib/SkedParser.ts` (branches on `timetable.type` and, for `graphical`, per faculty) -> rooms resolved via `lib/Room/` -> cached -> `createEvent` in `model/SplusEinsModel.ts`, which censors lecturer names unless `CENSOR_DISABLE` and derives a stable id from the title. Room and info HTML is sanitized because the client renders it.

## Server

- `config.ts` is the only place that reads env vars; an invalid number aborts startup.
- `lib/cache.ts` is a file cache (`cached(key, ttl, load)`) with one JSON file per key under `CACHE_PATH`. It deduplicates concurrent loads and never caches failures. Values always go through JSON, which the return type `Jsonify<T>` from type-fest reflects, so models use ISO strings instead of `Date`s.
- Validate external JSON with type guards (`lib/isRecord.ts`) instead of casts.

## Web

- Plans (`src/lib/plans.ts`) are written in URLs and the API as sources, e.g. `se3!a.b,wpf:c`.
- `src/stores/persist.js` saves to `localStorage`. Timetable ids contain the semester, old ones are dropped on startup. Bump `VERSION` only when the saved format changes.
- `__TEAM__`, `__STAGING__` and `__VERSION__` are build-time constants from `vite.config.js`. `__TEAM__` ends up in the client bundle.
- `/api` and `/docs` are always proxied, by Vite in dev and by `web/server.js` in production, which also serves `dist/` and answers unknown paths with `index.html`.
- The service worker caches `/api/*` NetworkFirst, except `/api/ics/`.
