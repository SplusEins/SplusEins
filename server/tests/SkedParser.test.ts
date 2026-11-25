import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  parseSkedCSV,
  parseSkedGraphical,
  parseSkedList,
  parseTimetableIntranet,
} from '../lib/SkedParser';

const fixture = (name: string) =>
  readFileSync(join(__dirname, 'fixtures', name), 'utf8');

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
        room: expect.stringContaining('>D-222</a>'),
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
        room: expect.stringContaining('>D-021</a>'),
        lecturer: 'Prof. Dr. Vanis',
        start: '2026-11-16T07:00:00.000Z',
      },
    ]);
  });

  it('should keep entries without a title so that users notice them', () => {
    const html = fixture('soziale-arbeit.html').replace(
      'Ringveranstaltung Ethik',
      'Erstsemesterbegrüßung',
    );
    const lectures = parseSkedGraphical(html, 'Soziale Arbeit');
    expect(lectures).toHaveLength(2);
    expect(lectures[1]).toMatchObject({
      title: '',
      info: 'Erstsemesterbegrüßung, Aula',
    });
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

  it('should skip CSV rows it cannot read instead of failing', () => {
    const csv = [
      'Datum;Uhrzeit;Veranstaltung',
      '09.11.2026;ganztägig;Blockseminar',
      '10.11.2026;8:15 - 9:45 Uhr;Datenbanken;extra',
    ].join('\n');
    const events = parseSkedCSV(csv);
    expect(events.map(({ title }) => title)).toEqual(['Datenbanken']);
  });

  it('should parse an intranet plan', () => {
    expect(parseTimetableIntranet(fixture('intranet.html'))).toMatchSnapshot();
  });
});
