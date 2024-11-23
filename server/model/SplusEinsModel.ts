import { ParsedLecture } from './SplusModel';
import * as crypto from 'crypto';

const CENSOR_DISABLE = !!process.env.CENSOR_DISABLE;

export interface NewsElement {
  title: string;
  link: string;
  text: string;
  date?: Date;
  source?: string;
}

export interface MensaPrice {
  student: string
  employee: string
  guest: string
}

export interface MensaMeal {
  name: string,
  date: string,
  price: MensaPrice,
  lane: string,
  categories: string[]
}

export interface MensaDayPlan {
  date: string;
  meals: MensaMeal[];
}

export interface MensaAddress {
  line1: string,
  line2: string,
  street: string,
  zip: number,
  city: string
}

export interface MensaOpening {
  time: 'morning' | 'noon' | 'evening',
  start_day: number,
  end_day: number,
  start_time: string,
  end_time: string
}

export interface Mensa {
  name: string,
  id: number,
  opening_hours: MensaOpening[],
  address: MensaAddress,
  dayPlans: MensaDayPlan[],
  url: string
}

export interface StwMensaTags {
  categories: {name:string}[]
  allergens: {name:string}[]
}

export interface StwMensaMeal {
  id: number
  date: string
  name: string
  price: MensaPrice
  time: string
  lane: {name:string}
  tags: StwMensaTags
}

export interface TimetableRequest {
  id: string;
  week: number;
  skedPath: string;
  faculty: string;
  type: string
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
  semester: number | number [];
}

export interface Timetable {
  name?: string,
  // eslint-disable-next-line no-use-before-define
  events: Event[];
  meta: TimetableMetadata;
}

export class Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  duration: number;
  location: string;
  meta: EventMetadata;

  private generateId (title: string): string {
    // since the id is part of the url it should not contain /, + or =
    return crypto.createHash('sha1').update(title).digest('base64').replace(/[/+=]/g, '').slice(0, 5);
  }

  private censorOrganiserName (name: string): string {
    return name.split(' ').map(part =>
      (new RegExp('Prof|Dr|Dipl|Ing|Inform|Herr|Frau|MA|BA|rer.|nat.|Master|Bachelor', 'g').test(part)) || part.length < 3 ? part : part.charAt(0) + '.')
      .join(' ')
  }

  private generateOrganiserShortname (lecturer: string): string {
    return lecturer
      .replace(/Prof|Dr|Dipl|Ing|Inform|Herr|Frau|MA|BA|rer.|nat.|Master|Bachelor/g, '')
      .replace('ä', 'ae').replace('ö', 'oe').replace('ü', 'ue').replace('ß', 'ss')
      .replace(/[^a-z]/gi, ' ')
      .split(' ')
      .filter((w) => ![' ', ''].includes(w))
      .join(' ');
  }

  constructor (lecture: ParsedLecture) {
    this.id = this.generateId(lecture.title);
    this.title = lecture.title;
    this.start = lecture.start;
    this.end = lecture.end;
    this.duration = lecture.duration;
    this.location = lecture.room;
    this.meta = {
      organiserShortname: this.generateOrganiserShortname(CENSOR_DISABLE ? lecture.lecturer : this.censorOrganiserName(lecture.lecturer)),
      organiserName: CENSOR_DISABLE ? lecture.lecturer : this.censorOrganiserName(lecture.lecturer),
      description: lecture.info
    };
  }
}
