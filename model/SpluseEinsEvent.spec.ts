import { ParsedLecture } from '../server/lib/ParsedLecture';
import { SplusEinsEvent } from './SplusEinsEvent';
import moment = require('moment');

describe('Test Event', () => {
  function testLecture(title = 'Test - VL',
                       lecturer = 'Prof. Dr. tst. S. Eins'): ParsedLecture {
    return <ParsedLecture>{
      title,
      day: 1,
      start: moment('2019-03-19T07:15:00.000Z').toDate(),
      end: moment('2019-03-19T08:45:00.000Z').toDate(),
      duration: 1.5,
      info: 'Nur für Unit-Tests',
      room: 'R404',
      lecturer,
    };
  }

  it('should construct from an ILecture', () => {
    const event = new SplusEinsEvent(testLecture(), 0);
    expect(event).toBeDefined();
    expect(event.id).toBeDefined();
    expect(event.meta.organiserId).toBeDefined();
    expect(event.duration).toBeDefined();
    expect(event.start.valueOf()).toBe(Date.parse('2019-03-19T07:15:00.000Z'));
  });

  it('should generate a unique title id', () => {
    function expectAllLecturesHaveDifferentTitleIds(titleVariations) {
      const lectures = titleVariations.map(
        (title) => new SplusEinsEvent(testLecture(title), 0));
      lectures.forEach(
        (lecture1, index) => lectures.slice(index + 1).forEach(
          (lecture2) => expect(lecture1.id).not.toBe(lecture2.id)));
    }

    expectAllLecturesHaveDifferentTitleIds([
      'Mathematik für die Informatik',
      'Mathe Cafe 2. Sem',
    ]);
    expectAllLecturesHaveDifferentTitleIds([
      'Elektr. u. magn. Felder',
      'Elektr. Bauelemente & Schaltungen',
    ]);
    expectAllLecturesHaveDifferentTitleIds([
      'Algorithmen und Datenstrukturen - VL',
      'Algorithmen und Datenstrukturen Labor',
    ]);
    expectAllLecturesHaveDifferentTitleIds([
      'Elektr. Bauelemente & Schaltungen stud. Tut.',
      'Elektr. Bauelemente & Schaltungen',
    ]);
    expectAllLecturesHaveDifferentTitleIds([
      'Elektr. u. magn. Felder',
      'Elektr. u. magn. Felder (online)',
    ]);
    expectAllLecturesHaveDifferentTitleIds([
      'IE-Wissensmanagement',
      'ITM-Wirtschaftsrecht',
    ]);
  });

  it('should generate the same title id for similar lectures', () => {
    function expectAllLecturesHaveSameTitleId(titleVariations) {
      const lectures = titleVariations.map(
        (title) => new SplusEinsEvent(testLecture(title), 0));
      lectures.slice(1).forEach(
        (lecture) => expect(lecture.id).toBe(lectures[0].id));
    }

    expectAllLecturesHaveSameTitleId([
      '-Fremdsprache auf erhöhten Niveau 2. Sem. Binf - Kurs B',
      'Fremdsprache auf erhöhten Niveau 2. Sem. Binf - Kurs B',
    ]);
  });

  it('should generate a unique lecturer id', () => {
    function expectAllLecturesHaveDifferentLecturerIds(lecturerVariations) {
      const lectures = lecturerVariations.map(
        (lecturer) => new SplusEinsEvent(testLecture('', lecturer), 0));
      lectures.forEach(
        (lecture1, index) => lectures.slice(index + 1).forEach(
          (lecture2) => expect(lecture1.id).not.toBe(lecture2.id)));
    }

    expectAllLecturesHaveDifferentLecturerIds([
      'Prof. Dr. P. Riegler',
      'Prof. Dr. F. Seutter',
      'Herr Brodowski',
      'Prof. Dr. M. Huhn'
    ]);
  });

  it('should generate the same lecturer id for similar lectures', () => {
    function expectAllLecturesHaveSameLecturerId(lecturerVariations) {
      const lectures = lecturerVariations.map(
        (lecturer) => new SplusEinsEvent(testLecture('', lecturer), 0));
      lectures.slice(1).forEach(
        (lecture) => expect(lecture.id).toBe(lectures[0].id));
    }

    expectAllLecturesHaveSameLecturerId([
      'Dr. F. Seutter',
      'Prof. Dr. F. Seutter',
      'F. Seutter',
    ]);
    expectAllLecturesHaveSameLecturerId([
      'F. Höppner',
      'F. Hoeppner',
    ]);
  });

  it('should generate ids for an empty title and lecturer', () => {
    const lecture = new SplusEinsEvent(testLecture('', ''), 0);
  });
});
