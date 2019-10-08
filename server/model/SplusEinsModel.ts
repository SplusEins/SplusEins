import { ParsedLecture } from './SplusModel';
import * as crypto from 'crypto';

export interface NewsElement {
  title: string;
  link: string;
  text: string;
  date?: Date;
  source?: string;
};

export interface MensaDayPlan {
  date: Date;
  data: object;
};

export interface TimetableRequest {
  id: string;
  week: number;
  setplan: boolean;
  raumplan: boolean;
};

export interface EventMetadata {
  organiserShortname: string;
  organiserName: string;
  description: string;
};

export interface TimetableMetadata {
  splusID: string | string[];
  faculty: string | string[];
  degree: string | string[];
  specialisation: string | string[];
  semester: number | number [];
}

export interface Timetable {
  name: string,
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

  private generateId(title: string): string {
    //since the id is part of the url it should not contain /, + or =
    return crypto.createHash('sha1').update(title).digest('base64').replace(/[\/+=]/g, '').slice(0, 5);
  }

  private generateOrganiserShortname(lecturer: string): string {
    return lecturer
      .replace(/Prof|Dr|Dipl|Ing|Herr|Frau|MA|BA/g, '')
      .replace('ä', 'ae').replace('ö', 'oe').replace('ü', 'ue').replace('ß', 'ss')
      .replace(/[^a-z]/gi, ' ')
      .split(' ')
      .filter((w) => w.length > 3)
      .join(' ');
  }

  constructor(lecture: ParsedLecture) {
    this.id = this.generateId(lecture.title);
    this.title = lecture.title;
    this.start = lecture.start;
    this.end = lecture.end;
    this.duration = lecture.duration;
    this.location = lecture.room;
    this.meta = {
                 organiserShortname: this.generateOrganiserShortname(lecture.lecturer),
                 organiserName: lecture.lecturer,
                 description: lecture.info
                };
  }
};
