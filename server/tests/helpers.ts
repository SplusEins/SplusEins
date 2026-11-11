import { readFileSync } from 'fs';
import { vi } from 'vitest';
import { join } from 'path';
import TIMETABLES from '../assets/timetables.json';

export const fixture = (name: string) =>
  readFileSync(join(__dirname, 'fixtures', name), 'utf8');

/**
 * Replace the global fetch. The handler gets the URL and returns the response.
 */
export function mockFetch(
  handler: (url: string) => Response | Promise<Response>,
) {
  return vi
    .spyOn(globalThis, 'fetch')
    .mockImplementation(async (input) => handler(String(input)));
}

/* a timetable whose plan is parsed like tests/fixtures/graphical.html */
export const graphicalTimetables = TIMETABLES.filter(
  ({ type, faculty }) => type === 'graphical' && faculty === 'Bau-Wasser-Boden',
);

/* calendar week of the lectures in tests/fixtures/graphical.html */
export const FIXTURE_WEEK = 46;
