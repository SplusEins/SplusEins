import fetch, { Headers } from 'node-fetch';
import * as cacheManager from 'cache-manager';
import * as fsStore from 'cache-manager-fs-hash';
import * as moment from 'moment';
import { Event, TimetableRequest } from '../model/SplusEinsModel';
import { parseSkedCSV, parseSkedGraphical, parseSkedList } from './SkedParser';
import * as sanitize from 'sanitize-html';
import { ParsedLecture } from '../model/SplusModel';
import * as iconv from 'iconv-lite';

const SKED_BASE = process.env.SKED_URL || 'https://stundenplan.ostfalia.de/';

const flatten = <T>(arr: T[][]) => [].concat(...arr) as T[];

const SKED_USER = process.env.SKED_USER;
const SKED_PASSWORD = process.env.SKED_PASSWORD;

// default must be in /tmp because the rest is RO on AWS Lambda
const CACHE_PATH = process.env.CACHE_PATH || '/tmp/spluseins-cache';
const CACHE_DISABLE = !!process.env.CACHE_DISABLE;
const CACHE_SECONDS = parseInt(process.env.SPLUS_CACHE_SECONDS || '10800');

const cache = CACHE_DISABLE
  ? cacheManager.caching({ store: 'memory', max: 0 })
  : cacheManager.caching({
    store: fsStore,
    options: {
      path: CACHE_PATH,
      ttl: 60,
      subdirs: true
    }
  });

function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch sked-timetable from stundenplan.ostfalia.de
 * @param timetable request
 * @returns HTML-string
 */
async function skedRequest (timetable: TimetableRequest): Promise<string> {
  const token = Buffer.from(SKED_USER + ':' + SKED_PASSWORD).toString('base64');
  const headers = new Headers();
  headers.append('Authorization', 'Basic ' + token);

  const url = SKED_BASE + timetable.skedPath;
  console.log(`Url for ${timetable.id} is ${url}`)
  let errorMsg = '';
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url, { headers });
    if (res.ok) {
      if (timetable.type === 'csv') {
        // CSV files are stored windows1252 encoded, convert them
        return iconv.decode(await res.buffer(), 'windows1252');
      }
      return res.text()
    }

    if (res.status < 500) {
      // Client side error, throw directly
      throw new Error(`${res.status}: Ostfalia Sked replied "${res.statusText}"`);
    }
    errorMsg = `${res.status} Sked error for ${timetable.id}: ${res.statusText} (attempt ${attempt})`;
    console.error(errorMsg);
    await sleep(100);
  }

  throw new Error(errorMsg);
}

/**
 * Parses HTML to Events
 *
 * @param timetable request
 * @returns parsed Events
 */
async function parseTimetable (timetable: TimetableRequest): Promise<Event[]> {
  const key = `lectures-${timetable.id}`;

  return await cache.wrap(key, async () => {
    console.log(`Lectures cache miss for key ${key}`);
    const data = await skedRequest(timetable);
    let lectures: ParsedLecture[];
    switch (timetable.type) {
      case 'graphical':
        lectures = parseSkedGraphical(data, timetable.faculty)
        break;
      case 'list':
        lectures = parseSkedList(data);
        break;
      case 'csv':
        lectures = parseSkedCSV(data);
        break;
      default:
        throw new Error(`Unsupported timetable type detected: ${timetable.type}.`);
    }
    lectures = lectures.map(lecture => {
      const allowLinksConfig: sanitize.IOptions = {
        allowedTags: ['a'],
        allowedAttributes: { a: ['href', 'target'] }
      }
      // Allow only specific HTML attributes for the room since we directly render the HTML in the client
      // Not doing this could lead to XSS possibilities, or some weird rendering if classes or styles are present in the tag
      lecture.room = sanitize(lecture.room, allowLinksConfig).replace('&amp;', '&')
      lecture.room = roomToLocation(lecture.room)
      lecture.info = sanitize(lecture.info, allowLinksConfig).replace('&amp;', '&')
      // Strip all html
      lecture.lecturer = sanitize(lecture.lecturer, {}).replace('&amp;', '&')
      lecture.title = sanitize(lecture.title, {}).replace('&amp;', '&')
      return lecture
    })
    console.log(`Storing ${lectures.length} parsed lectures for ${key} in cache`)
    return lectures.map((lecture) => new Event(lecture));
  }, { ttl: CACHE_SECONDS });
}

/**
 * Adds the full address to the room, where available.
 *
 * @param string the old room string
 * @returns string the enhanced room name as an address
 */
function roomToLocation(rooms: string): string {
  return rooms
    .split(', ')
    .map((room: string) => room.trim())
    .map((room: string): string => {
      // match rooms of the exer address, https://regex101.com/r/gGmwbl/1
      const matchExer = /^(?<building>\d+)\/(?<room>\d+)(?<room_extra>-\w+)?(\s+\((?<room_name>.+)\))?/.exec(room);
      if (matchExer) {
        return `${room}, Am Exer ${matchExer['building']} Wolfenbüttel, Germany`;
      }
      // match rooms of the main address, https://regex101.com/r/krwu5H/1
      const matchMain = /^([A-FL]\d{3})\s+(.+)/.exec(room);
      if (matchMain) {
        return `${room}, Salzdahlumer Str. 46/48 Wolfenbüttel, Germany`;
      }
      return room;
    })
    .join(', ');
}

/**
 * Executes the timetable parsing and returns only unique events.
 *
 * Uniqueness is determined by the ID field (which is derived from the title of the event/lecture).
 *
 * @param timetable request, the week field will be ignored.
 * @returns An array of the unique events. Parameters for a specific event (like start and end date) are set to null.
 */
export async function getUniqueEvents (timetable: TimetableRequest): Promise<Event[]> {
  const allEvents = await parseTimetable(timetable);
  // Filter unique events
  const uniqueEvents = [...new Set(allEvents.map(obj => obj.id))] // search all unique IDs
    .map(id => {
      // map IDs back to events, but copy by value first so we don't modify existing cache objects!
      const matchingEvent = allEvents.slice().find(evt => evt.id == id);
      // TODO uncomment this, but make sure the events pass by value works
      // For some reason https://github.com/SplusEins/SplusEins/pull/466 was NOT enough
      // clear end and start since this is just one of the random events for this ID
      // matchingEvent.start = null;
      // matchingEvent.end = null;
      return matchingEvent;
    });
  console.log(`Returning ${uniqueEvents.length} unique lecture metadata for ${timetable.id}`);
  return uniqueEvents
}

/**
 * Manages multiple TimetableRequests
 *
 * @param timetables request
 * @returns requested Events
 */
export async function getEvents (timetables: TimetableRequest[]): Promise<Event[]> {
  const allEvents = await Promise.all(timetables.map((timetable: TimetableRequest) => parseTimetable(timetable)
    .then(events => {
      // Return only events for the correct week of a single request
      events = events.filter(lecture => moment(lecture.start).isoWeek() == timetable.week)
      console.log(`Serving ${events.length} lectures for ${timetable.id}`)
      return events;
    })
  )).then(flatten);

  // filter duplicates
  const key = (event: Event) =>
    `${event.meta.organiserShortname} ${event.id} ${event.location} ` +
    `${event.start} ${event.end}`;
  const eventsByKey = new Map<string, Event>();
  allEvents.forEach((event) => eventsByKey.set(key(event), event));
  const events = [...eventsByKey.values()];

  return events;
}
