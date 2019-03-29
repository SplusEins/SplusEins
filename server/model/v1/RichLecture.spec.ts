import { ILecture } from '../../lib/v1/ILecture';
import { RichLecture } from './RichLecture';

describe('Test RichLecture', () => {
  function testLecture(title = 'Test - VL',
                       lecturer = 'Prof. Dr. tst. S. Eins'): ILecture {
    return <ILecture>{
      title,
      day: 1,
      begin: 8.25,
      end: 9.75,
      info: 'Nur für Unit-Tests',
      room: 'R404',
      lecturer,
    };
  }

  it('should construct from an ILecture', () => {
    const lecture = new RichLecture(testLecture(), 0);
    expect(lecture).toBeDefined();
    expect(lecture.titleId).toBeDefined();
    expect(lecture.lecturerId).toBeDefined();
    expect(lecture.duration).toBeDefined();
    expect(lecture.start.valueOf()).toBe(Date.parse('2018-12-24T23:00:00.0000Z'));
  });

  it('should generate a unique title id', () => {
    function expectAllLecturesHaveDifferentTitleIds(titleVariations) {
      const lectures = titleVariations.map(
        (title) => new RichLecture(testLecture(title), 0));
      lectures.forEach(
        (lecture1, index) => lectures.slice(index + 1).forEach(
          (lecture2) => expect(lecture1.titleId).not.toBe(lecture2.titleId)));
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
        (title) => new RichLecture(testLecture(title), 0));
      lectures.slice(1).forEach(
        (lecture) => expect(lecture.titleId).toBe(lectures[0].titleId));
    }

    expectAllLecturesHaveSameTitleId([
      '-Fremdsprache auf erhöhten Niveau 2. Sem. Binf - Kurs B',
      'Fremdsprache auf erhöhten Niveau 2. Sem. Binf - Kurs B',
    ]);
  });

  it('should generate a unique lecturer id', () => {
    function expectAllLecturesHaveDifferentLecturerIds(lecturerVariations) {
      const lectures = lecturerVariations.map(
        (lecturer) => new RichLecture(testLecture('', lecturer), 0));
      lectures.forEach(
        (lecture1, index) => lectures.slice(index + 1).forEach(
          (lecture2) => expect(lecture1.lecturerId).not.toBe(lecture2.lecturerId)));
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
        (lecturer) => new RichLecture(testLecture('', lecturer), 0));
      lectures.slice(1).forEach(
        (lecture) => expect(lecture.lecturerId).toBe(lectures[0].lecturerId));
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
    const lecture = new RichLecture(testLecture('', ''), 0);
  });
});
