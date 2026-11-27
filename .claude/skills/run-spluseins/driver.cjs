#!/usr/bin/env node
// Before/after screenshots of the SplusEins web app for pull requests.
//
//   node driver.cjs shoot --before http://localhost:4001 --after http://localhost:4002 --out DIR
//   node driver.cjs markdown --dir DIR --raw-base https://raw.githubusercontent.com/...
//
// See SKILL.md next to this file.
const fs = require('node:fs');
const path = require('node:path');
const { parseArgs } = require('node:util');
const { chromium, devices } = require('playwright');

const REPO = path.resolve(__dirname, '../../..');

const PAGES = [
  ['start', '/', 'Start page'],
  ['plaene', '/plaene', 'Pläne'],
  ['mensa', '/mensa', 'Mensa'],
  ['bus', '/bus', 'Bus'],
];
const LABELS = {
  disclaimer: 'Disclaimer',
  plan: 'Plan',
  kurse: 'Kurse auswählen',
  'plan-dark': 'Plan, dark',
  'start-dark': 'Start page, dark',
  ...Object.fromEntries(PAGES.map(([name, , label]) => [name, label])),
};
const ORDER = ['plan', 'start', 'kurse', 'mensa', 'bus', 'plaene', 'disclaimer', 'plan-dark', 'start-dark'];

const VIEWS = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
  phone: { ...devices['Pixel 7'] },
};

function defaultPlan() {
  const file = path.join(REPO, 'web/src/assets/timetables.json');
  const timetables = JSON.parse(fs.readFileSync(file, 'utf8'));
  const plan = timetables.find((t) => /^i_informatik_1_/.test(t.id)) ?? timetables[0];
  return plan.id;
}

async function settle(page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1200);
}

async function clickIfThere(page, name) {
  const button = page.getByRole('button', { name, exact: true });
  if (await button.count()) {
    await button.first().click();
    await page.waitForTimeout(700);
    return true;
  }
  return false;
}

/* the phone header has no dark mode button, the store works everywhere */
async function toggleDark(page) {
  await page.evaluate(() =>
    document.querySelector('#app').__vue_app__.config.globalProperties.$pinia._s.get('ui').toggleDark(),
  );
  await page.waitForTimeout(800);
}

async function run(browser, base, plan, view, shot, log) {
  const context = await browser.newContext({ ...VIEWS[view], colorScheme: 'light' });
  const page = await context.newPage();
  page.on('console', (m) => m.type() === 'error' && log(`console error: ${m.text()}`));
  page.on('pageerror', (e) => log(`page error: ${e.message}`));

  await page.goto(`${base}/plan/${plan}`);
  await settle(page);
  await shot(page, 'disclaimer');
  if (!(await clickIfThere(page, 'Verstanden'))) log('no disclaimer dialog');
  if (!(await clickIfThere(page, 'Merken'))) log('no "Merken" button, start page shows no lectures');
  await shot(page, 'plan');

  if (view === 'desktop') {
    if (await clickIfThere(page, 'Kurse auswählen')) {
      await page.waitForTimeout(500);
      await shot(page, 'kurse');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } else log('no "Kurse auswählen" button');
  }

  for (const [name, route] of PAGES) {
    await page.goto(base + route);
    await settle(page);
    await shot(page, name);
  }

  await page.goto(`${base}/plan/${plan}`);
  await settle(page);
  await toggleDark(page);
  await shot(page, 'plan-dark');
  await page.goto(`${base}/`);
  await settle(page);
  await shot(page, 'start-dark');
  await context.close();
}

/* one side-by-side sheet per view, to look at all screenshots at once */
async function contactSheets(browser, out, versions) {
  for (const view of Object.keys(VIEWS)) {
    const names = ORDER.filter((n) => versions.some((v) => fs.existsSync(path.join(out, `${n}-${view}-${v}.png`))));
    const width = view === 'desktop' ? 560 : 220;
    const cell = (file) =>
      fs.existsSync(file)
        ? `<img src="data:image/png;base64,${fs.readFileSync(file).toString('base64')}" width="${width}">`
        : '';
    const rows = names
      .map((n) => `<tr><th>${n}</th>${versions.map((v) => `<td>${cell(path.join(out, `${n}-${view}-${v}.png`))}</td>`).join('')}</tr>`)
      .join('');
    const page = await browser.newPage({ viewport: { width: 400, height: 300 } });
    await page.setContent(
      `<style>body{margin:8px;font:12px sans-serif}td,th{vertical-align:top;padding:4px}img{border:1px solid #c00}</style>
       <table><tr><th></th>${versions.map((v) => `<th>${v}</th>`).join('')}</tr>${rows}</table>`,
    );
    await page.screenshot({ path: path.join(out, `sheet-${view}.png`), fullPage: true });
    await page.close();
  }
}

async function shoot(args) {
  const versions = Object.entries({ before: args.before, after: args.after }).filter(([, base]) => base);
  if (!versions.length || !args.out) throw new Error('needs --out and --before and/or --after');
  const plan = args.plan ?? defaultPlan();
  fs.mkdirSync(args.out, { recursive: true });
  const browser = await chromium.launch();

  // Vite optimizes dependencies the first time a lazy component (calendar, dialogs,
  // mensa tabs) is loaded and then reloads the page, which blanks a screenshot.
  console.log(`warming up the dev servers with plan ${plan}`);
  for (const [, base] of versions) {
    for (const view of Object.keys(VIEWS)) {
      await run(browser, base, plan, view, async () => {}, () => {});
    }
  }

  for (const [version, base] of versions) {
    for (const view of Object.keys(VIEWS)) {
      const log = (text) => console.log(`${version} ${view}: ${text}`);
      const shot = (page, name) => page.screenshot({ path: path.join(args.out, `${name}-${view}-${version}.png`) });
      await run(browser, base, plan, view, shot, log);
    }
  }
  await contactSheets(browser, args.out, versions.map(([v]) => v));
  await browser.close();
  console.log(`screenshots and sheet-desktop.png / sheet-phone.png in ${args.out}`);
}

function markdown(args) {
  if (!args.dir || !args['raw-base']) throw new Error('needs --dir and --raw-base');
  const files = fs.readdirSync(args.dir);
  const versions = ['before', 'after'].filter((v) => files.some((f) => f.endsWith(`-${v}.png`)));
  const main = { desktop: ['plan', 'start', 'kurse'], phone: ['plan', 'start', 'mensa'] };
  const table = (names, view, width) =>
    [
      `| | ${versions.map((v) => v[0].toUpperCase() + v.slice(1)).join(' | ')} |`,
      `| --- |${versions.map(() => ' --- |').join('')}`,
      ...names.map(
        (n) =>
          `| ${LABELS[n]} | ${versions
            .map((v) => `<img src="${args['raw-base']}/${n}-${view}-${v}.png" alt="${LABELS[n]}, ${v}" width="${width}">`)
            .join(' | ')} |`,
      ),
    ].join('\n');
  const parts = [];
  for (const [view, title, width] of [['desktop', 'Desktop', 420], ['phone', 'Phone', 240]]) {
    const names = ORDER.filter((n) => files.includes(`${n}-${view}-${versions[0]}.png`));
    const shown = names.filter((n) => main[view].includes(n));
    const rest = names.filter((n) => !shown.includes(n));
    parts.push(`### ${title}\n\n${table(shown, view, width)}`);
    if (rest.length) {
      parts.push(`<details>\n<summary>${rest.map((n) => LABELS[n]).join(', ')}</summary>\n\n${table(rest, view, width)}\n\n</details>`);
    }
  }
  console.log(parts.join('\n\n'));
}

const [command, ...rest] = process.argv.slice(2);
const { values } = parseArgs({
  args: rest,
  options: Object.fromEntries(['before', 'after', 'out', 'plan', 'dir', 'raw-base'].map((o) => [o, { type: 'string' }])),
});
if (command === 'shoot') shoot(values).catch((e) => (console.error(e), process.exit(1)));
else if (command === 'markdown') markdown(values);
else console.error('usage: driver.cjs shoot|markdown ... (see SKILL.md)'), process.exit(1);
