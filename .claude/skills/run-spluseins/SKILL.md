---
name: run-spluseins
description: Run the SplusEins web app headless, take screenshots of it, and attach before/after screenshots to a pull request. Use when asked to screenshot SplusEins, show what a web change looks like, add screenshots to a PR, or start the web dev server against the live API.
---

Screenshots of the web app come from `.claude/skills/run-spluseins/driver.cjs`, a Playwright script that drives one or two Vite dev servers (the PR branch, optionally master) against the live API. Paths are relative to the repository root. Before screenshots are nice to have, not required: leave out `--before` for a quick after-only set.

## Setup

Chromium and Playwright are preinstalled in cloud sessions (`require('playwright')` works anywhere), nothing to install. Use a scratch directory outside the repo, one git worktree per version:

```bash
W=<scratchpad>/pr-shots; BRANCH=claude/design-foundations   # the PR branch
mkdir -p $W && git fetch -q origin master $BRANCH
git worktree add -q --detach $W/after origin/$BRANCH
git worktree add -q --detach $W/before origin/master        # optional
(cd $W/after/web && npm ci --silent) && (cd $W/before/web && npm ci --silent)
```

## Run (agent path)

Start the dev servers against the live API (same as `npm run dev:remote`, but on free ports) and wait until they answer:

```bash
(cd $W/before/web && API_URL=https://spluseins.de/ nohup npx vite --port 4001 --strictPort > $W/before.log 2>&1 &)
(cd $W/after/web && API_URL=https://spluseins.de/ nohup npx vite --port 4002 --strictPort > $W/after.log 2>&1 &)
timeout 60 bash -c 'until curl -sf localhost:4001 >/dev/null && curl -sf localhost:4002 >/dev/null; do sleep 1; done'
```

Take the screenshots (about 3 minutes for both versions on cold servers, half without `--before`):

```bash
node .claude/skills/run-spluseins/driver.cjs shoot --before http://localhost:4001 --after http://localhost:4002 --out $W/shots
node .claude/skills/run-spluseins/driver.cjs shoot --after http://localhost:4002 --out $W/shots   # after only
```

It warms up the servers with a throwaway pass, then for each version, desktop (1440×900, 2x) and phone (Pixel 7) opens `/plan/<id>`, shoots the disclaimer, clicks "Verstanden" and "Merken" (so the start page has lectures), shoots the plan and, on desktop, the "Kurse auswählen" dialog, then `/`, `/plaene`, `/mensa`, `/bus`, and the plan and start page in dark mode. Files are `<page>-<desktop|phone>-<before|after>.png`. The plan is the first `i_informatik_1_*` timetable in `web/src/assets/timetables.json`, override with `--plan <id>`. It prints console errors and missing buttons.

**Look at `$W/shots/sheet-desktop.png` and `sheet-phone.png`** (all screenshots side by side) before publishing anything.

Stop the servers and remove the worktrees:

```bash
for p in 4001 4002; do lsof -ti:$p -sTCP:LISTEN | xargs -r kill; done
git worktree remove --force $W/before; git worktree remove --force $W/after
```

For a page or state the driver does not cover, add a step to `run()` in `driver.cjs` rather than writing a one-off script.

## Attach to a pull request

1. Create the draft PR first: the screenshot folder is named after its number.
2. Screenshots live on the branch `ccr-d91ff9e5-xid68w` under `pr-screenshots/<PR>/` (one commit per PR, "Add screenshots for PR <n>"). If it is gone, find it with:
   ```bash
   for b in $(git branch -r --format='%(refname:short)'); do git log -1 --format="%h $b" --grep='screenshots for PR' "$b"; done
   ```
3. Commit and push them (the PNGs only, not the sheets):
   ```bash
   N=<PR number>; git fetch -q origin ccr-d91ff9e5-xid68w
   git worktree add -q $W/shotsbranch -B ccr-d91ff9e5-xid68w origin/ccr-d91ff9e5-xid68w
   mkdir -p $W/shotsbranch/pr-screenshots/$N && cp $W/shots/*-before.png $W/shots/*-after.png $W/shotsbranch/pr-screenshots/$N/
   cd $W/shotsbranch && git add pr-screenshots/$N && git commit -q -m "Add screenshots for PR $N" && git push -q origin ccr-d91ff9e5-xid68w && git rev-parse HEAD
   ```
4. Generate the tables for the description from the commit SHA (raw URLs with the SHA keep working when the branch moves on) and put them under a `## Screenshots` heading:
   ```bash
   node .claude/skills/run-spluseins/driver.cjs markdown --dir $W/shots \
     --raw-base https://raw.githubusercontent.com/SplusEins/SplusEins/<sha>/pr-screenshots/$N > $W/screenshots.md
   ```
   Plan, start page and Kurse dialog (phone: plan, start, mensa) are shown, the rest is in a `<details>` block. Check one URL with `curl -s -o /dev/null -w "%{http_code}"` before updating the PR.

## Gotchas

- **Vite reloads the page the first time it sees a lazy dependency** (`VCalendar` on the plan, `VCheckbox` in the Kurse dialog, `VTabs`/`VCarousel` on the mensa page). The screenshot taken at that moment is a blank page with the plain wordmark header. `driver.cjs` therefore does a full throwaway pass first. `grep reloading $W/*.log` shows when it happened; all reloads must be before the first file in `$W/shots`.
- **The disclaimer dialog ("Hinweis") covers the first page** of every new browser context, also on the phone. The driver shoots it once and clicks "Verstanden".
- **Dark mode has no button in the phone header.** The driver toggles it through the Pinia store: `document.querySelector('#app').__vue_app__.config.globalProperties.$pinia._s.get('ui').toggleDark()`.
- **Without a saved plan the start page has no "Als Nächstes" card**, so the driver clicks "Merken" on the plan first.
- **"Heute" is hidden while the current week is shown** (since the toolbar rework), so it is missing in the screenshots. Say so in the PR if it matters.
- **On master "Kurse auswählen" is in the overflow menu on phones**, so the dialog is only shot on desktop.
- **Timetable ids contain the semester** (`_ws26`), so never hard-code one. The default comes from `timetables.json` of the repo the driver is in.
- **The data is live** (spluseins.de/api), so before and after can differ by a few minutes in bus times and the news.

## Troubleshooting

- **A screenshot shows only the header and an empty page**: a Vite dependency reload hit it (see above). Run `shoot` again, the servers are warm now.
- **`locator.click: Timeout` on a button**: the button does not exist in that version or viewport. Use `clickIfThere` in `driver.cjs` for anything optional.
