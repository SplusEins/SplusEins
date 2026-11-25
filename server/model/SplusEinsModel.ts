import { ParsedLecture } from './SplusModel';
import { config } from '../config';
import { shortHash } from '../lib/shortHash';
import type { Event, MensaAddress, MensaOpening, MensaPrice } from './api';

const CENSOR_DISABLE = config.censorDisable;
const ACADEMIC_TITLES =
  /^(Prof\.?|Dr\.?|Dipl\.?|Ing\.?|Inform\.?|Herr|Frau|MA|BA|rer\.|nat\.|Master|Bachelor)$/i;

export interface StwLocation {
  id: number;
  name: string;
  address: MensaAddress;
  opening_hours: MensaOpening[];
}

export interface StwMensaTags {
  categories: { name: string }[];
  allergens: { name: string }[];
}

export interface StwMensaMeal {
  id: number;
  date: string;
  name: string;
  price: MensaPrice;
  time: string;
  lane: { name: string };
  tags: StwMensaTags;
}

export interface TimetableRequest {
  id: string;
  timetablePath: string;
  faculty: string;
  type: string;
}

function censorOrganiserName(name: string): string {
  return name
    .split(',')
    .map((part) =>
      part
        .trim()
        .split(/\s+/)
        .map((word) =>
          ACADEMIC_TITLES.test(word) || word.length < 3 ? word : word[0] + '.',
        )
        .join(' '),
    )
    .join(', ');
}

function generateOrganiserShortname(lecturer: string): string {
  return lecturer
    .split(',')
    .map((part) =>
      part
        .trim()
        .split(/\s+/)
        .filter((word) => !ACADEMIC_TITLES.test(word) && word.length > 0)
        .map((word) =>
          word
            .replace(/[äÄ]/g, 'ae')
            .replace(/[öÖ]/g, 'oe')
            .replace(/[üÜ]/g, 'ue')
            .replace(/ß/g, 'ss')
            .replace(/[^a-zA-Z]/g, ''),
        )
        .filter(Boolean)
        .map((word) => word[0])
        .join(' '),
    )
    .join(', ');
}

export function createEvent(lecture: ParsedLecture): Omit<Event, 'rooms'> {
  const organiserName = CENSOR_DISABLE
    ? lecture.lecturer
    : censorOrganiserName(lecture.lecturer);
  return {
    // the id is part of the url, so it must not contain /, + or =
    id: shortHash(lecture.title, 5),
    title: lecture.title,
    start: lecture.start.toISOString(),
    end: lecture.end.toISOString(),
    duration: lecture.duration,
    location: lecture.room,
    meta: {
      organiserShortname: generateOrganiserShortname(organiserName),
      organiserName,
      description: lecture.info,
    },
  };
}
