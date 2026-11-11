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
 * output with `npx jest -u` and check the differences.
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

  it('should parse a graphical plan of Fahrzeugtechnik', () => {
    expect(
      parseSkedGraphical(fixture('fahrzeugtechnik.html'), 'Fahrzeugtechnik'),
    ).toMatchSnapshot();
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
