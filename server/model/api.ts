// Shapes of the JSON the API sends. The web app imports them with
// `import type`, so this file must not import anything.

export interface NewsElement {
  title: string;
  link: string;
  text: string;
  /* ISO date, e.g. '2026-11-20T09:00:00.000Z' */
  date?: string;
  source?: string;
  /* who published the news, e.g. 'Fakultät Recht' or 'Sprachenzentrum' */
  departments?: string[];
}

export interface MensaPrice {
  student: string;
  employee: string;
  guest: string;
}

export interface MensaMeal {
  name: string;
  date: string;
  price: MensaPrice;
  lane: string;
  categories: string[];
}

export interface MensaDayPlan {
  date: string;
  meals: MensaMeal[];
}

export interface MensaAddress {
  line1: string;
  line2: string;
  street: string;
  zip: number;
  city: string;
}

export interface MensaOpening {
  time: 'morning' | 'noon' | 'evening';
  start_day: number;
  end_day: number;
  start_time: string;
  end_time: string;
}

export interface Mensa {
  name: string;
  id: number;
  key: string;
  opening_hours: MensaOpening[];
  address: MensaAddress;
  dayPlans: MensaDayPlan[];
  url: string;
}

export interface EventMetadata {
  organiserShortname: string;
  organiserName: string;
  description: string;
}

export interface TimetableMetadata {
  id: string | string[];
  faculty: string | string[];
  degree: string | string[];
  specialisation: string | string[];
  semester: number | number[];
}

export interface Timetable {
  name?: string;
  events: Event[];
  meta: TimetableMetadata;
}

export interface Room {
  name: string;
  address?: string;
  /* a map centered on the room */
  url?: string;
}

export interface Event {
  id: string;
  title: string;
  /* ISO dates, e.g. '2026-11-20T07:15:00.000Z' */
  start: string;
  end: string;
  duration: number;
  /* the rooms as in the timetable, e.g. 'A209, B107' */
  location: string;
  rooms: Room[];
  meta: EventMetadata;
  colorIndex?: number;
}

export interface BusDeparture {
  /* ISO date */
  date: string;
  /* e.g. '420' */
  line: string;
}

export interface BusDepartures {
  departures: {
    exerToFh: BusDeparture[];
    fhToExer: BusDeparture[];
  };
  /* timestamp in milliseconds */
  lastUpdated: number;
}
