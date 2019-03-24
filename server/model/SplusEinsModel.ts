import { ParsedLecture } from './SplusModel';

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
  label: string | string[];
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

  private generateTitleId(title: string): string {
    switch (title) {
      case 'IE-Wissensmanagement':
        return 'IW';
      case 'ITM-Wirtschaftsrecht':
        return 'IW2';
      case 'Betriebssysteme':
        return 'B';
      case 'Batteriesysteme':
        return 'B2';
      case 'BWL':
        return 'B3';
      case 'FDynReg':
        return 'F1';
      case 'FEM':
        return 'F2';
      case 'Festigkeitslehre':
        return 'F3';
      case 'Ingeniurmathematik':
        return 'I1';
      case 'Internetprotokolle':
        return 'I2';
      case 'KonstKunst':
        return 'K1';
      case 'KostGerKons':
        return 'K2';
      case 'MathePLUS':
        return 'M1';
      case 'MDyn':
        return 'M2';
      case 'MikroC':
        return 'M3';
      case 'Physik':
        return 'P1';
      case 'Projektmanagement':
        return 'P2';
      case 'Recht':
        return 'R1';
      case 'Regelungstechnik':
        return 'R2';
      case 'RegTechV':
        return 'R3';
      case 'Sachenrecht':
        return 'S1';
      case 'SchaltT':
        return 'S2';
      case 'SenMessDV':
        return 'S3';
      case 'Sim':
        return 'S4';
      case 'SteuerT':
        return 'S5';
      case 'Thermodynamik':
        return 'T1';
      case 'Tribologie':
        return 'T2';
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

  constructor(lecture: ParsedLecture) {
    this.id = this.generateTitleId(lecture.title);
    this.title = lecture.title;
    this.start = lecture.start;
    this.end = lecture.end;
    this.duration = lecture.duration;
    this.location = lecture.room;
    this.meta = {
                 organiserId: this.generateLecturerId(lecture.lecturer), 
                 organiserName: lecture.lecturer, 
                 description: lecture.info
                };
  }
};

