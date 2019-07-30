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
};

export interface EventMetadata {
  organiserId: string;
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
    return crypto.createHash('sha1').update(title).digest('hex').slice(0, 5);
  }

  constructor(lecture: ParsedLecture) {
    this.id = this.generateId(lecture.title);
    this.title = lecture.title;
    this.start = lecture.start;
    this.end = lecture.end;
    this.duration = lecture.duration;
    this.location = lecture.room;
    this.meta = {
                 organiserId: this.generateId(lecture.lecturer),
                 organiserName: lecture.lecturer,
                 description: lecture.info
                };
  }
};
