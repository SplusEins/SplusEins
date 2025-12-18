import { ParsedLecture } from '../model/SplusModel';
import { Event } from '../model/SplusEinsModel';
import * as moment from 'moment';

describe('Test Event', () => {
  function testLecture(
    title = 'Test - VL',
    lecturer = 'Prof. Dr. tst. S. Eins',
  ): ParsedLecture {
    return <ParsedLecture>{
      title,
      start: moment('2019-03-19T07:15:00.000Z').toDate(),
      end: moment('2019-03-19T08:45:00.000Z').toDate(),
      duration: 1.5,
      info: 'Nur für Unit-Tests',
      room: 'R404',
      lecturer,
    };
  }

  it('should construct from an ParsedLecture', () => {
    const event = new Event(testLecture());
    expect(event).toBeDefined();
    expect(event.id).toBeDefined();
    expect(event.meta.organiserShortname).toBeDefined();
    expect(event.duration).toBeDefined();
    expect(event.start.valueOf()).toBe(Date.parse('2019-03-19T07:15:00.000Z'));
  });

  it('should generate a unique title id', () => {
    function expectAllLecturesHaveDifferentTitleIds(titleVariations) {
      const lectures = titleVariations.map(
        (title) => new Event(testLecture(title)),
      );
      lectures.forEach((lecture1, index) =>
        lectures
          .slice(index + 1)
          .forEach((lecture2) => expect(lecture1.id).not.toBe(lecture2.id)),
      );
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

  it('should generate a unique lecturer id', () => {
    function expectAllLecturesHaveDifferentOrganiserShortnames(
      lecturerVariations,
    ) {
      const lectures = lecturerVariations.map(
        (lecturer) => new Event(testLecture('', lecturer)),
      );
      lectures.forEach((lecture1, index) =>
        lectures
          .slice(index + 1)
          .forEach((lecture2) =>
            expect(lecture1.meta.organiserShortname).not.toBe(
              lecture2.meta.organiserShortname,
            ),
          ),
      );
    }

    expectAllLecturesHaveDifferentOrganiserShortnames([
      'Prof. Dr. P. Riegler',
      'Prof. Dr. F. Seutter',
      'Herr Brodowski',
      'Prof. Dr. M. Huhn',
    ]);
  });

  it('should generate ids for an empty title and lecturer', () => {
    const lecture = new Event(testLecture('', ''));
  });
});
