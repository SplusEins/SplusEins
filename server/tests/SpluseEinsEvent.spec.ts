import { describe, it, expect } from 'vitest';
import { ParsedLecture } from '../model/SplusModel';
import { createEvent } from '../model/SplusEinsModel';

describe('Test Event', () => {
  function testLecture(
    title = 'Test - VL',
    lecturer = 'Prof. Dr. tst. S. Eins',
  ): ParsedLecture {
    return {
      title,
      start: new Date('2019-03-19T07:15:00.000Z'),
      end: new Date('2019-03-19T08:45:00.000Z'),
      duration: 1.5,
      info: 'Nur für Unit-Tests',
      room: 'R404',
      lecturer,
    };
  }

  it('should construct from an ParsedLecture', () => {
    const event = createEvent(testLecture());
    expect(event).toBeDefined();
    expect(event.id).toBeDefined();
    expect(event.meta.organiserShortname).toBeDefined();
    expect(event.duration).toBeDefined();
    expect(event.start).toBe('2019-03-19T07:15:00.000Z');
  });

  it('should generate a unique title id', () => {
    function expectAllLecturesHaveDifferentTitleIds(titleVariations: string[]) {
      const lectures = titleVariations.map((title) =>
        createEvent(testLecture(title)),
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
      lecturerVariations: string[],
    ) {
      const lectures = lecturerVariations.map((lecturer) =>
        createEvent(testLecture('', lecturer)),
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
    const lecture = createEvent(testLecture('', ''));
  });
});
