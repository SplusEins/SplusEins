import { describe, expect, it } from 'vitest';
import dayjs, { upcomingIsoWeeks } from '../lib/dayjs';

describe('Test upcomingIsoWeeks', () => {
  it('should count up within a year', () => {
    expect(upcomingIsoWeeks(3, dayjs('2026-11-11'))).toEqual([46, 47, 48]);
  });

  it('should continue with week 1 after the end of a year', () => {
    // 2026 has 53 ISO weeks
    expect(upcomingIsoWeeks(4, dayjs('2026-12-23'))).toEqual([52, 53, 1, 2]);
    expect(upcomingIsoWeeks(3, dayjs('2027-12-29'))).toEqual([52, 1, 2]);
  });
});
