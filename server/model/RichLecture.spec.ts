import { ILecture } from '../lib/ILecture';
import { RichLecture } from './RichLecture';

describe('Test RichLecture', () => {
  function testLecture(title = 'Test - VL'): ILecture {
    return <ILecture>{
      title,
      day: 1,
      begin: 8.25,
      end: 9.75,
      info: 'Nur für Unit-Tests',
      room: 'R404',
      lecturer: 'Prof. Dr. tst. S. Eins',
    };
  }

  it('should construct from an ILecture', () => {
    const lecture = new RichLecture(testLecture(), 0);
    expect(lecture).toBeDefined();
    expect(lecture.id).toBeDefined();
    expect(lecture.duration).toBeDefined();
    expect(lecture.start.valueOf()).toBe(Date.parse('2017-12-26T00:00:00.0000Z'));
  });

  it('should generate a unique id', () => {
    function expectAllLecturesHaveDifferentIds(titleVariations) {
      const lectures = titleVariations.map(
        (title) => new RichLecture(testLecture(title), 0));
      lectures.forEach(
        (lecture1, index) => lectures.slice(index + 1).forEach(
          (lecture2) => expect(lecture1.id).not.toBe(lecture2.id)));
    }

    expectAllLecturesHaveDifferentIds([
      'Mathematik für die Informatik',
      'Mathe Cafe 2. Sem',
    ]);
    expectAllLecturesHaveDifferentIds([
      'Elektr. u. magn. Felder',
      'Elektr. Bauelemente & Schaltungen',
    ])
  });

  it('should generate the same id for similar lectures', () => {
    function expectAllLecturesHaveSameId(titleVariations) {
      const lectures = titleVariations.map(
        (title) => new RichLecture(testLecture(title), 0));
      lectures.slice(1).forEach(
        (lecture) => expect(lecture.id).toBe(lectures[0].id));
    }

    expectAllLecturesHaveSameId([
      '-Fremdsprache auf erhöhten Niveau 2. Sem. Binf - Kurs B',
      'Fremdsprache auf erhöhten Niveau 2. Sem. Binf - Kurs B',
    ]);
    expectAllLecturesHaveSameId([
      'Algorithmen und Datenstrukturen - VL',
      'Algorithmen und Datenstrukturen Labor',
    ]);
    expectAllLecturesHaveSameId([
      'Elektr. Bauelemente & Schaltungen stud. Tut.',
      'Elektr. Bauelemente & Schaltungen',
    ]);
    expectAllLecturesHaveSameId([
      'Elektr. u. magn. Felder',
      'Elektr. u. magn. Felder (online)',
    ]);
  });

  it('should generate an empty lecture id for an empty title', () => {
    const lecture = new RichLecture(testLecture(''), 0);
  });
});
