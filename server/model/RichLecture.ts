import * as moment from 'moment';
import { ILecture } from '../lib/ILecture';

export class RichLecture {
  /* ILecture attributes */
  title: string;
  day: number;
  begin: number;
  info: string;
  room: string;
  lecturer: string;

  /* derived attributes */
  id: string;
  start: Date;
  duration: number;

  private generateId(lecture: ILecture): string {
    return (lecture.title
      .replace(/(Alt|Sonder|Gruppe).*$/g, '')
      .replace(/labor|vl|tut|online/gi, '')
      .match(/[A-Z0-9]/g) || [])
      .join('');
  }

  private lectureToDate(lecture: ILecture, week: number): Date {
    return moment()
      .startOf('date')
      .isoWeek(week)
      .isoWeekday(lecture.day + 1)
      .toDate();
  }

  constructor(lecture: ILecture, week: number) {
    this.title = lecture.title;
    this.day = lecture.day;
    this.begin = lecture.begin;
    this.info = lecture.info;
    this.room = lecture.room;
    this.lecturer = lecture.lecturer;
    this.id = this.generateId(lecture);
    this.start = this.lectureToDate(lecture, week);
    this.duration = lecture.end - lecture.begin;
  }
};