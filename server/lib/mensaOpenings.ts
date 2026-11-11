import { MensaOpening } from '../model/SplusEinsModel';

const SUDERBURG = 134;
const SATURDAY = 6;
const SUNDAY = 0;
const MONDAY = 1;
const FRIDAY = 5;

const isWeekend = (day: number) => day === SATURDAY || day === SUNDAY;

/**
 * Reduce the opening hours of the Studentenwerk API to weekdays and remove duplicates.
 *
 * @param entries opening hours, days are numbered like Date.getDay() (0 = sunday)
 * @param mensaId id of the mensa
 */
export function filterMensaOpenings(
  entries: MensaOpening[],
  mensaId?: number,
): MensaOpening[] {
  return uniqueOpenings(weekdayOpenings(entries, mensaId));
}

function weekdayOpenings(
  entries: MensaOpening[],
  mensaId?: number,
): MensaOpening[] {
  // special handling for Suderburg, since the API returns multiple opening hours (only one is correct)
  if (mensaId === SUDERBURG) {
    // Suderburg: prefer 12:00–13:30 entries (source: stw-on.de/suderburg/essen/mensa)
    const filtered = entries.filter(
      (entry) =>
        entry.start_time === '12:00:00' &&
        entry.end_time === '13:30:00' &&
        entry.end_day !== SUNDAY,
    );

    if (filtered.length > 0) {
      return filtered.map((entry) => ({ ...entry, start_day: MONDAY }));
    }
    // fallback: if the opening hours are changed at some point, just continue with the default filtering below
  }

  return (
    entries
      // remove entries which are only on the weekend
      .filter(
        (entry) => !(isWeekend(entry.start_day) && isWeekend(entry.end_day)),
      )
      // limit the others to monday to friday
      .map((entry) => ({
        ...entry,
        start_day: isWeekend(entry.start_day) ? MONDAY : entry.start_day,
        end_day: isWeekend(entry.end_day) ? FRIDAY : entry.end_day,
      }))
  );
}

function uniqueOpenings(entries: MensaOpening[]): MensaOpening[] {
  const byJson = new Map<string, MensaOpening>();
  for (const entry of entries) {
    const json = JSON.stringify(entry);
    if (!byJson.has(json)) byJson.set(json, entry);
  }
  return [...byJson.values()];
}
