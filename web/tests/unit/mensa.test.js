import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useMensaStore } from '../../src/stores/mensa';

const dayPlan = (date) => ({ date, meals: [{ name: `Essen am ${date}` }] });
const plans = [
  {
    name: 'Mensa Wolfenbüttel',
    dayPlans: [dayPlan('2026-11-10'), dayPlan('2026-11-11')],
  },
  { name: 'Mensa Salzgitter', dayPlans: [dayPlan('2026-11-12')] },
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
