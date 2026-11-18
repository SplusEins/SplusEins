import { describe, it, expect } from 'vitest';
import {
  parseSkedCSV,
  parseSkedGraphical,
  parseSkedList,
  parseTimetableIntranet,
} from '../lib/SkedParser';
import { fixture } from './helpers';

/**
 * These tests compare the output of the parsers with the saved output in
 * __snapshots__/. If a parser was changed on purpose, update the saved
 * output with `npx vitest run -u` and check the differences.
 */
describe('Test SkedParser', () => {
  const graphicalFaculties = [
    'Versorgungstechnik',
    'Recht',
    'Bau-Wasser-Boden',
    'Handel und Soziale Arbeit',
    'Wirtschaft',
    'Gesundheitswesen',
  ];
  it.each(graphicalFaculties)(
    'should parse a graphical plan of %s',
    (faculty) => {
      expect(
        parseSkedGraphical(fixture('graphical.html'), faculty),
      ).toMatchSnapshot();
    },
  );

  it('should parse a graphical plan of Soziale Arbeit', () => {
    expect(
      parseSkedGraphical(fixture('soziale-arbeit.html'), 'Soziale Arbeit'),
    ).toMatchSnapshot();
  });

  it('should parse a master plan of Soziale Arbeit', () => {
    const lectures = parseSkedGraphical(
      fixture('soziale-arbeit-master.html'),
      'Soziale Arbeit',
    );
    expect(
      lectures.map(({ title, room, lecturer, start, end }) => ({
        title,
        room,
        lecturer,
        start: start.toISOString(),
        end: end.toISOString(),
      })),
    ).toEqual([
      {
        title: 'Evaluation und Wirkungsorientierung',
        room: '6/137',
        lecturer: 'Wunderlich',
        start: '2026-11-09T07:15:00.000Z',
        end: '2026-11-09T08:45:00.000Z',
      },
      {
        title: 'Forschungsarbeit mit Begleitung (2)',
        room: '6/042, 6/056',
        lecturer: 'Rost, Schultz',
        start: '2026-11-10T09:00:00.000Z',
        end: '2026-11-10T17:00:00.000Z',
      },
    ]);
  });

  it('should parse a graphical plan of Fahrzeugtechnik', () => {
    expect(
      parseSkedGraphical(fixture('fahrzeugtechnik.html'), 'Fahrzeugtechnik'),
    ).toMatchSnapshot();
  });

  it('should parse Fahrzeugtechnik entries with missing or additional lines', () => {
    const lectures = parseSkedGraphical(
      fixture('fahrzeugtechnik.html'),
      'Fahrzeugtechnik',
    );
    expect(
      lectures.map(({ title, room, lecturer, start }) => ({
        title,
        room,
        lecturer,
        start: start.toISOString(),
      })),
    ).toEqual([
      {
        title: 'Mentoring',
        room: 'D-222',
        lecturer: '',
        start: '2026-11-11T10:30:00.000Z',
      },
      {
        title: 'Fahrdynamik',
        room: 'F-101',
        lecturer: 'Becker',
        start: '2026-11-12T07:15:00.000Z',
      },
      {
        title: 'Labor Verbrennungsmotoren',
        room: '',
        lecturer: 'Prof. Dr.-Ing. Becker',
        start: '2026-11-13T10:30:00.000Z',
      },
      {
        title: 'Mathematik II',
        room: 'D-021',
        lecturer: 'Prof. Dr. Vanis',
        start: '2026-11-16T07:00:00.000Z',
      },
    ]);
  });

  const cell = (lines: string[]) =>
    '<table><tr><td></td><td>Mo, 09.11.2026</td></tr><tr><td>8:00</td>' +
    `<td>8:00 - 9:30 Uhr<br>${lines.join('<br>')}</td></tr></table>`;

  /* cells shaped like the current plans, with made-up names. The layouts change
     from time to time: values must rather end up in info than in a wrong field */
  it.each([
    [
      'an entry without a title, so that users notice it',
      'Soziale Arbeit',
      ['', 'Aula'],
      { title: '', room: 'Aula' },
    ],
    [
      'a Soziale Arbeit cell',
      'Soziale Arbeit',
      ['S-Gruppenarbeit', 'Muster', '6/058 [1]'],
      { title: 'S-Gruppenarbeit', lecturer: 'Muster', room: '6/058' },
    ],
    [
      'a Wirtschaft cell',
      'Wirtschaft',
      ['Organisationslehre', 'Dipl.-Kfm. Muster', 'C-131'],
      {
        title: 'Organisationslehre',
        lecturer: 'Dipl.-Kfm. Muster',
        room: 'C-131',
      },
    ],
    [
      'a Handel und Soziale Arbeit cell',
      'Handel und Soziale Arbeit',
      ['16 Wissenschaftliches Arbeiten', 'A. Muster', 'Webkonferenz'],
      {
        title: '16 Wissenschaftliches Arbeiten',
        lecturer: 'A. Muster',
        room: 'Webkonferenz',
      },
    ],
    [
      'a lecture type as room',
      'Recht',
      ['F05.1 (2022)', 'Finanzbuchführung', 'Muster LL.M.', 'V', 'online'],
      { lecturer: 'Muster LL.M.', room: '', info: 'V, online' },
    ],
    [
      'student groups as room',
      'Verkehr-Sport-Tourismus-Medien',
      ['Personenverkehrssysteme', 'Prof. Dr. Muster', 'NaMo 3, NaMo 4'],
      { lecturer: 'Prof. Dr. Muster', room: '', info: 'NaMo 3, NaMo 4' },
    ],
    [
      'student groups as lecturer',
      'Wirtschaft',
      ['Wirtschaftsenglisch 1', 'Gr. 1', 'Muster'],
      { lecturer: '', room: '', info: 'Gr. 1, Muster' },
    ],
    [
      'a room as lecturer',
      'Bau-Wasser-Boden',
      ['Ü', 'Tutorium Mechanik', 'D6'],
      { title: 'Tutorium Mechanik', lecturer: '', room: 'D6', info: 'Ü' },
    ],
    [
      'a missing line before the lecturer',
      'Recht',
      ['BGB AT', 'Muster', 'R001', 'T', 'RFS'],
      { lecturer: '', room: 'R001' },
    ],
    [
      'only a title and a room',
      'Versorgungstechnik',
      ['Z03 Tutorium ELT I', 'CU05'],
      { title: 'Z03 Tutorium ELT I', lecturer: '', room: 'CU05' },
    ],
    [
      'only a lecturer and a title which looks like a room',
      'Versorgungstechnik',
      ['Muster', 'Z06 Thermo I - Labor'],
      { title: 'Z06 Thermo I - Labor', lecturer: 'Muster', room: '' },
    ],
  ])('should handle %s', (_, faculty, lines, expected) => {
    const lectures = parseSkedGraphical(cell(lines), faculty);
    expect(lectures).toHaveLength(1);
    expect(lectures[0]).toMatchObject(expected);
  });

  it('should estimate missing times for Maschinenbau', () => {
    expect(
      parseSkedGraphical(fixture('graphical-no-times.html'), 'Maschinenbau'),
    ).toMatchSnapshot();
  });

  it('should reject unknown faculties', () => {
    expect(() =>
      parseSkedGraphical(fixture('graphical.html'), 'Unbekannt'),
    ).toThrow();
  });

  it('should parse a list plan', () => {
    expect(parseSkedList(fixture('list.html'))).toMatchSnapshot();
  });

  it('should parse a CSV plan', () => {
    expect(parseSkedCSV(fixture('sked.csv'))).toMatchSnapshot();
  });

  it('should parse an intranet plan', () => {
    expect(parseTimetableIntranet(fixture('intranet.html'))).toMatchSnapshot();
  });
});
