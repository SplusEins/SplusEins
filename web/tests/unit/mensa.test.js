import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useMensaStore } from '../../src/stores/mensa';
import { useSplusStore } from '../../src/stores/splus';
import { matchesDiet, splitMealName, weekLabel } from '../../src/lib/mensa';

const dayPlan = (date) => ({ date, meals: [{ name: `Essen am ${date}` }] });
const plans = [
  {
    key: 'wf',
    name: 'Mensa Wolfenbüttel',
    dayPlans: [dayPlan('2026-11-10'), dayPlan('2026-11-11')],
  },
  {
    key: 'sz',
    name: 'Mensa Salzgitter',
    faculties: ['Verkehr-Sport-Tourismus-Medien'],
    dayPlans: [dayPlan('2026-11-12')],
  },
];

describe('mensa store', () => {
  let mensa;

  beforeEach(() => {
    setActivePinia(createPinia());
    mensa = useMensaStore();
    mensa.plans = plans;
  });

  afterEach(() => vi.useRealTimers());

  it("shows today's plan before 15:00", () => {
    vi.useFakeTimers({ now: new Date(2026, 10, 10, 12) });
    expect(mensa.getNextAvailablePlan.date).toBe('2026-11-10');
  });

  it("shows tomorrow's plan after 15:00", () => {
    vi.useFakeTimers({ now: new Date(2026, 10, 10, 15) });
    expect(mensa.getNextAvailablePlan.date).toBe('2026-11-11');
  });

  it('shows the next available plan if there is none for today', () => {
    vi.useFakeTimers({ now: new Date(2026, 10, 9, 12) });
    expect(mensa.getNextAvailablePlan.date).toBe('2026-11-10');
  });

  it('uses the selected location', () => {
    vi.useFakeTimers({ now: new Date(2026, 10, 10, 12) });
    mensa.setLocation('sz');
    expect(mensa.getNextAvailablePlan.date).toBe('2026-11-12');
  });

  it('uses the first mensa if the selected one is missing', () => {
    vi.useFakeTimers({ now: new Date(2026, 10, 10, 12) });
    mensa.setLocation('sud');
    expect(mensa.selectedPlan.key).toBe('wf');
  });

  it('uses the mensa of the saved faculty until one is chosen', () => {
    useSplusStore().favoriteIds = ['k_ap_1_ws26'];
    expect(mensa.selectedPlan.key).toBe('sz');
    mensa.setLocation('wf');
    expect(mensa.selectedPlan.key).toBe('wf');
  });

  it('names the day of a plan of today', () => {
    vi.useFakeTimers({ now: new Date(2026, 10, 10, 12) });
    expect(mensa.nextPlanDay).toBe('Heute');
  });

  it('names the day of a plan of tomorrow', () => {
    vi.useFakeTimers({ now: new Date(2026, 10, 10, 15) });
    expect(mensa.nextPlanDay).toBe('Morgen');
  });

  it('does not name the day of a later plan', () => {
    vi.useFakeTimers({ now: new Date(2026, 10, 1, 12) });
    expect(mensa.nextPlanDay).toBeUndefined();
  });

  it('has no meals without plans', () => {
    mensa.plans = null;
    expect(mensa.getNextAvailablePlan).toEqual({ meals: [] });
  });

  it('keeps plans empty if the API has no data', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 204 })),
    );
    await mensa.load();
    expect(mensa.plans).toBeNull();
    vi.unstubAllGlobals();
  });
});

describe('mensa meals', () => {
  it('splits a meal name into dish and sides', () => {
    expect(splitMealName('Ofenkartoffel | Kräuterquark | Feldsalat |')).toEqual(
      {
        title: 'Ofenkartoffel',
        sides: 'mit Kräuterquark, Feldsalat',
      },
    );
    expect(splitMealName('Sauerkraut')).toEqual({
      title: 'Sauerkraut',
      sides: '',
    });
  });

  it('filters meals by diet', () => {
    expect(matchesDiet('all', ['Schwein'])).toBe(true);
    expect(matchesDiet('vegetarian', ['Vegan'])).toBe(true);
    expect(matchesDiet('vegetarian', ['Fisch'])).toBe(false);
    expect(matchesDiet('vegan', ['Vegetarisch'])).toBe(false);
  });
});

describe('weekLabel', () => {
  afterEach(() => vi.useRealTimers());

  it('names the week relative to today', () => {
    vi.useFakeTimers({ now: new Date(2026, 10, 25, 12) });
    expect(weekLabel('2026-11-23')).toBe('Diese Woche');
    expect(weekLabel('2026-11-27')).toBe('Diese Woche');
    expect(weekLabel('2026-11-30')).toBe('Nächste Woche');
    expect(weekLabel('2026-12-08')).toBe('KW 50');
  });
});
