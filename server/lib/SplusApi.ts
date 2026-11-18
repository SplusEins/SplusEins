import sanitize from 'sanitize-html';
import { config } from '../config';
import iconv from 'iconv-lite';
import dayjs from './dayjs';
import { cached } from './cache';
import { Event, TimetableRequest } from '../model/SplusEinsModel';
import {
  parseSkedCSV,
  parseSkedGraphical,
  parseTimetableIntranet,
  parseSkedList,
} from './SkedParser';
import { ParsedLecture } from '../model/SplusModel';
import { getLectureRoomLocations } from './Room/RoomLocationApi';

const CACHE_SECONDS = config.splusCacheSeconds;
const TIMEOUT_MILLISECONDS = 20 * 1000;

// Allow only specific HTML attributes for the room since we directly render the HTML in the client
// Not doing this could lead to XSS possibilities, or some weird rendering if classes or styles are present in the tag
const ALLOW_LINKS: sanitize.IOptions = {
  allowedTags: ['a'],
  allowedAttributes: { a: ['href', 'target'] },
};
const STRIP_HTML: sanitize.IOptions = {
  allowedTags: [],
  allowedAttributes: {},
};

function clean(html: string, options: sanitize.IOptions): string {
  return sanitize(html, options).replaceAll('&amp;', '&');
}

/**
 * The Ostfalia server answered with an error status.
 */
export class SkedError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch timetable from ostfalia.de
 * @param timetable request
 * @returns HTML-string
 */
async function timetableRequest(timetable: TimetableRequest): Promise<string> {
  try {
    return await fetchWithRetries(timetable);
  } catch (e) {
    // the timeout also covers reading the body
    if (e instanceof Error && e.name === 'TimeoutError') {
      const error = new SkedError(504, `Sked timed out for ${timetable.id}`);
      console.error(error.message);
      throw error;
    }
    throw e;
  }
}

async function fetchWithRetries(timetable: TimetableRequest): Promise<string> {
  const token = Buffer.from(
    config.skedUser + ':' + config.skedPassword,
  ).toString('base64');
  const headers = new Headers();
  headers.append('Authorization', 'Basic ' + token);

  const url = timetable.timetablePath;
  console.log(`Url for ${timetable.id} is ${url}`);
  let error: SkedError | undefined;
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(TIMEOUT_MILLISECONDS),
    });
    if (res.ok) {
      if (timetable.type === 'csv') {
        // CSV files are stored windows1252 encoded, convert them
        return iconv.decode(
          Buffer.from(await res.arrayBuffer()),
          'windows1252',
        );
      }
      return await res.text();
    }

    if (res.status < 500) {
      // Client side error, throw directly
      throw new SkedError(
        res.status,
        `${res.status}: Ostfalia Sked replied "${res.statusText}"`,
      );
    }
    error = new SkedError(
      res.status,
      `${res.status} Sked error for ${timetable.id}: ${res.statusText} (attempt ${attempt})`,
    );
    console.error(error.message);
    await sleep(100);
  }

  throw error;
}

/**
 * Parses HTML to Events
 *
 * @param timetable request
 * @returns parsed Events
 */
async function parseTimetable(timetable: TimetableRequest): Promise<Event[]> {
  const key = `lectures-${timetable.id}`;

  return await cached(key, CACHE_SECONDS, async () => {
    console.log(`Lectures cache miss for key ${key}`);
    const data = await timetableRequest(timetable);
    let lectures: ParsedLecture[];
    switch (timetable.type) {
      case 'graphical':
        lectures = parseSkedGraphical(data, timetable.faculty);
        break;
      case 'list':
        lectures = parseSkedList(data);
        break;
      case 'csv':
        lectures = parseSkedCSV(data);
        break;
      case 'intranet':
        lectures = parseTimetableIntranet(data);
        break;
      default:
        throw new Error(
          `Unsupported timetable type detected: ${timetable.type}.`,
        );
    }
    lectures = lectures.map((lecture) => ({
      ...lecture,
      room: getLectureRoomLocations(
        clean(lecture.room, ALLOW_LINKS).split(','),
        timetable.faculty,
      ),
      info: clean(lecture.info, ALLOW_LINKS),
      lecturer: clean(lecture.lecturer, STRIP_HTML),
      title: clean(lecture.title, STRIP_HTML),
    }));
    console.log(
      `Storing ${lectures.length} parsed lectures for ${key} in cache`,
    );
    return lectures.map((lecture) => new Event(lecture));
  });
}

/**
 * Executes the timetable parsing and returns only unique events.
 *
 * Uniqueness is determined by the ID field (which is derived from the title of the event/lecture).
 *
 * @param timetable request
 * @returns The first event of each lecture.
 */
export async function getUniqueEvents(
  timetable: TimetableRequest,
): Promise<Event[]> {
  const allEvents = await parseTimetable(timetable);
  // keep the first event of each lecture
  const eventsById = new Map<string, Event>();
  for (const event of allEvents) {
    if (!eventsById.has(event.id)) eventsById.set(event.id, event);
  }
  const uniqueEvents = [...eventsById.values()];
  console.log(
    `Returning ${uniqueEvents.length} unique lecture metadata for ${timetable.id}`,
  );
  return uniqueEvents;
}

/**
 * @param timetables the timetables to merge
 * @param weeks ISO weeks to return events of
 * @param titleIds return only events with these ids, or all if empty
 * @returns the events, each only once even if it is in several timetables
 */
export async function getEvents(
  timetables: TimetableRequest[],
  weeks: number[],
  titleIds: string[] = [],
): Promise<Event[]> {
  const weekSet = new Set(weeks);
  const allEvents = (
    await Promise.all(
      timetables.map(async (timetable) => {
        const parsed = await parseTimetable(timetable);
        // index over the whole semester so a course keeps its color every week
        const titles = [...new Set(parsed.map(({ title }) => title))].sort();
        parsed.forEach((event) => {
          event.colorIndex = titles.indexOf(event.title);
        });
        const events = parsed.filter(
          (event) =>
            weekSet.has(dayjs(event.start).isoWeek()) &&
            (titleIds.length === 0 || titleIds.includes(event.id)),
        );
        console.log(`Serving ${events.length} lectures for ${timetable.id}`);
        return events;
      }),
    )
  ).flat();

  // filter duplicates
  const key = (event: Event) =>
    `${event.meta.organiserShortname} ${event.id} ${event.location} ` +
    `${event.start} ${event.end}`;
  const eventsByKey = new Map<string, Event>();
  allEvents.forEach((event) => eventsByKey.set(key(event), event));
  return [...eventsByKey.values()];
}
