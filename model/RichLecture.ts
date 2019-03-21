import * as moment from 'moment';
import { ILecture } from '../server/lib/ILecture';

export class RichLecture {
  /* ILecture attributes */
  title: string;
  day: number;
  begin: number;
  info: string;
  room: string;
  lecturer: string;

  /* derived attributes */
  titleId: string;
  lecturerId: string;
  start: Date;
  duration: number;

  private generateTitleId(title: string): string {
    switch (title) {
      case 'ITM-Wirtschaftsrecht':
        return 'IW2';
    }
    return (title.match(/\b(\w)/g) || []).join('');
  }

  private generateLecturerId(lecturer: string): string {
    return lecturer
      .replace(/Prof|Dr|Dipl|Ing|Herr|Frau|MA|BA/g, '')
      .replace('ä', 'ae').replace('ö', 'oe').replace('ü', 'ue').replace('ß', 'ss')
      .replace(/[^a-z]/gi, ' ')
      .split(' ')
      .filter((w) => w.length > 3)
      .join(' ');
  }

  private lectureToDate(lecture: ILecture, week: number): Date {
    return moment()
      .utcOffset('+0100')
      .startOf('date')
      .isoWeek(week % 52)
      .isoWeekday(lecture.day + 1)
      .toDate();
  }

  constructor(lecture: ILecture, week: number) {
    this.title = lecture.title;
    this.titleId = this.generateTitleId(lecture.title);
    this.day = lecture.day;
    this.begin = lecture.begin;
    this.info = lecture.info;
    this.room = lecture.room;
    this.lecturer = lecture.lecturer;
    this.lecturerId = this.generateLecturerId(lecture.lecturer);
    this.start = this.lectureToDate(lecture, week);
    this.duration = lecture.end - lecture.begin;
  }
};
