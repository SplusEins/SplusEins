import { describe, expect, it } from 'vitest';
import { filterMensaOpenings } from '../lib/mensaOpenings';
import { MensaOpening } from '../model/SplusEinsModel';

const opening = (
  start_day: number,
  end_day: number,
  start_time = '11:00:00',
  end_time = '14:00:00',
): MensaOpening => ({
  time: 'noon',
  start_day,
  end_day,
  start_time,
  end_time,
});

describe('Test filterMensaOpenings', () => {
  it('should keep weekday openings', () => {
    expect(filterMensaOpenings([opening(1, 5)])).toEqual([opening(1, 5)]);
  });

  it('should remove openings which are only on the weekend', () => {
    expect(filterMensaOpenings([opening(6, 6), opening(0, 0)])).toEqual([]);
    expect(filterMensaOpenings([opening(6, 0)])).toEqual([]);
  });

  it('should limit openings to monday to friday', () => {
    expect(filterMensaOpenings([opening(1, 6)])).toEqual([opening(1, 5)]);
    expect(filterMensaOpenings([opening(0, 5)])).toEqual([opening(1, 5)]);
  });

  it('should keep monday', () => {
    expect(filterMensaOpenings([opening(1, 1)])).toEqual([opening(1, 1)]);
  });

  it('should remove duplicates', () => {
    expect(filterMensaOpenings([opening(1, 5), opening(1, 6)])).toEqual([
      opening(1, 5),
    ]);
  });

  it('should not change the given openings', () => {
    const openings = [opening(1, 6)];
    filterMensaOpenings(openings);
    expect(openings).toEqual([opening(1, 6)]);
  });

  it('should prefer the lunch opening in Suderburg', () => {
    const lunch = opening(2, 5, '12:00:00', '13:30:00');
    expect(filterMensaOpenings([opening(1, 5), lunch], 134)).toEqual([
      { ...lunch, start_day: 1 },
    ]);
  });
});
