# AGENTS.md

Guidance for coding agents working in this repository.

## Repository structure

Monorepo with three independent npm packages (each with its own `package.json`, `.nvmrc` (Node 24), ESLint/Prettier config). There is no root `package.json`, so always `cd` into a subproject first.

- `server/`: Express 5 API (TypeScript), served at `/api`
- `web/`: Vue 3 SPA (Vite, Vuetify, Pinia, Vue Router, PWA)
- `docs/`: VitePress docs (German), served at `/docs`. `docs/src/konfiguration.md` documents every env var, `server.md` the API endpoints, `deployment.md` the Dokku setup.
- `app/`: generated Bubblewrap TWA Android wrapper, not hand-maintained.

Each subproject is a separate Dokku app (`.dokku-monorepo`: `api=server`, `web=web`, `docs=docs`). `deploy.yml` deploys all three on push to `master`; `deploy-dev.yml` (manual) deploys `web-staging`/`api-staging`.

## Commands

```bash
# server/
npm run dev        # tsx watch, API at 127.0.0.1:3001/api
npm run build      # tsc -> dist/, `npm start` runs dist/server.js
npm test           # vitest run
npx vitest run tests/SkedParser.test.ts   # single file
npx vitest run -u  # update parser snapshots after an intended parser change

# web/
npm run dev:remote # Vite on :3000, proxies /api to https://spluseins.de/
npm run dev:local  # proxies /api to 127.0.0.1:3001 (run server/ alongside)
npm run build      # -> dist/, `npm start` serves it via server.js
npm test           # vitest, tests/unit/**/*.test.js

# docs/
npm run dev        # localhost:8080/docs/

# all
npm run lint / lintfix / fmt / fmt:check
```

CI order: server `lint -> fmt:check -> build -> test`; web `lint -> fmt:check -> test -> build`. Match it before pushing.

Server tests mock `fetch` with HTML/CSV fixtures in `server/tests/fixtures/`, so they need no Ostfalia credentials. `vitest.config.ts` forces `TZ=America/New_York` (results must not depend on server time zone) and `CACHE_DISABLE=true`.

## Architecture

### Timetable data flow

`timetable-config.yaml` (root) is input for the **external** Python tool [sked-parser](https://github.com/SplusEins/sked_parser), not for code here. The daily `timetables.yml` workflow runs it and opens a PR updating `server/assets/timetables.json` and `web/src/assets/timetables.json`. These are generated, never hand-edit them; `server/tests/Timetables.test.ts` guards them against duplicate ids/paths.

Request path: `controllers/splus.ts` looks up the id in `timetables.json` -> `lib/SplusApi.ts` fetches the page from Ostfalia (Basic Auth `SKED_USER`/`SKED_PASSWORD`, retries 5xx up to 3x) -> dispatches on `timetable.type` (`graphical` | `list` | `csv` | `intranet`) to `lib/SkedParser.ts`, where `graphical` also branches per faculty -> sanitizes room/info HTML with `sanitize-html` (it is rendered client-side) and resolves rooms via `lib/Room/` -> caches the parsed lectures -> wraps them in `Event` (`model/SplusEinsModel.ts`), which censors lecturer names unless `CENSOR_DISABLE` and derives a stable lecture id from a SHA1 of the title.

Mensa, news, bus (Motis/Transitous) and ICS export are sibling controllers in `server/controllers/` with logic in `server/lib/`.

### Server internals

- `config.ts` is the only place reading env vars; an invalid number aborts startup.
- `lib/cache.ts` is a hand-rolled file cache (`cached(key, ttl, load)`): one JSON file per SHA1'd key under `CACHE_PATH`, atomic writes, deduplicates concurrent loads, failures are not cached. Values round-trip through JSON, so `Date`s come back as strings.
- `App.ts` mounts the controllers under `API_PREFIX`, returns plain-text 404/500 and only logs error details.

### Frontend

- `src/pages/` (routes in `src/router.js`), `src/components/`, `src/stores/` (Pinia), `src/lib/` (API client and helpers).
- `src/stores/persist.js` saves the `ui`, `splus` and `mensa` stores to `localStorage`. Bump `VERSION` at semester change to drop users' saved timetables.
- Build-time constants (`__TEAM__`, `__STAGING__`, `__VERSION__`) come from `vite.config.js` via `define` and are read in `src/lib/config.js`. `__TEAM__` is `PROTECTED_INFORMATION` or `src/assets/protected-information.json`; it ends up in the client bundle, so it is only for mildly sensitive data.
- `/api` and `/docs` are proxied, not called cross-origin: by Vite in dev (`API_URL`, `DOCS_URL`) and by `web/server.js` (Express) in production, which also serves `dist/` and answers all other paths with an in-memory `index.html`.
- The service worker (`vite-plugin-pwa`) caches `/api/*` NetworkFirst, except `/api/ics/`.
