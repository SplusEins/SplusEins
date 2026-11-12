import { load } from 'cheerio';
import * as CSV from 'csv-string';
import dayjs from './dayjs';
import { ParsedLecture } from '../model/SplusModel';
import parseTable from './parseTable';

/* e.g. "09.11.2026 8:15" */
const NUMERIC_DATE_FORMAT = 'DD.MM.YYYY H:m';
/* e.g. "9. November 2026 8:15" */
const LONG_DATE_FORMAT = 'D. MMMM YYYY H:m';

/**
 * Parse start and end of a lecture. All times of the Ostfalia are german local times.
 *
 * @param date e.g. "09.11.2026"
 * @param startTime e.g. "8:15"
 * @param endTime e.g. "9:45"
 * @param formats formats which are tried one after another, see https://day.js.org/docs/en/parse/string-format
 * @returns start, end and duration in hours or undefined if the date or a time is invalid
 */
function parseTimes(
  date: string,
  startTime: string,
  endTime: string,
  formats = [NUMERIC_DATE_FORMAT],
): { start: Date; end: Date; duration: number } | undefined {
  for (const format of formats) {
    const start = dayjs.tz(`${date} ${startTime}`, format, 'Europe/Berlin');
    const end = dayjs.tz(`${date} ${endTime}`, format, 'Europe/Berlin');
    if (start.isValid() && end.isValid()) {
      return {
        start: start.toDate(),
        end: end.toDate(),
        duration: end.diff(start, 'hours', true),
      };
    }
  }
  return undefined;
}

export function parseSkedList(html: string): ParsedLecture[] {
  const $ = load(html);

  const events = [] as ParsedLecture[];

  let lastDatum = '';
  let datum = '';
  let uhrzeitStart = '';
  let uhrzeitEnde = '';
  let veranstaltung = '';
  let dozent = '';
  let raum = '';
  let anmerkung = '';

  // format "Liste"
  $('body table.tbl tbody tr[class^="tr"]').each(function () {
    const cols = $(this)
      .children('td')
      .get()
      .map((col) => $(col).text().replace(/-\s*$/, '').trim());

    switch (cols.length) {
      case 11:
        // Raumplan Informatik - https://stundenplan.ostfalia.de/i/R%c3%a4ume/Raumbelegung-Listenform/2-252.html
        raum = cols[0];
        datum = cols[2] || lastDatum;
        uhrzeitStart = cols[4];
        uhrzeitEnde = cols[5];
        dozent = cols[7];
        veranstaltung = cols[9];
        anmerkung = '';
        break;
      case 13:
        datum = cols[0] || lastDatum;
        uhrzeitStart = cols[2];
        uhrzeitEnde = cols[3];
        veranstaltung = cols[5];
        dozent = cols[7];
        raum = cols[9];
        anmerkung = cols[11];
        break;
      case 15:
        datum = cols[0] || lastDatum;
        uhrzeitStart = cols[2];
        uhrzeitEnde = cols[3];
        veranstaltung = cols[5];
        dozent = cols[7];
        raum = cols[9];
        anmerkung = cols[13];
        break;
      case 17:
        datum = cols[5] || lastDatum;
        uhrzeitStart = cols[0];
        uhrzeitEnde = cols[1];
        veranstaltung = cols[7];
        dozent = cols[3];
        raum = cols[9];
        anmerkung = cols[15];
        break;
      default:
        /**
         * Does not mean that an error occured.
         * Possibly a wrong row is parsed.
         */
        return;
    }

    lastDatum = datum;

    const times = parseTimes(datum, uhrzeitStart, uhrzeitEnde, [
      NUMERIC_DATE_FORMAT,
      LONG_DATE_FORMAT,
    ]);

    if (!times) {
      return;
    }

    events.push({
      info: anmerkung,
      room: raum,
      lecturer: dozent,
      title: veranstaltung.replace(/^I-/, ''),
      ...times,
    });
  });

  return events;
}

export function parseSkedCSV(csvString: string): ParsedLecture[] {
  const events = [] as ParsedLecture[];

  const arr = CSV.parse(csvString);
  // Pop the first row from the array since it contains the header strings
  const headerRow = arr.shift() ?? [];

  // iterate through every CSV row
  arr.forEach(function (cols) {
    let datum = '';
    let uhrzeitStart = '';
    let uhrzeitEnde = '';
    let veranstaltung = '';
    let dozent = '';
    let raum = '';
    let anmerkung = '';
    // Iterate through every CSV column
    cols.forEach(function (content, index) {
      // Get the name of this column from the header row by the current index
      const columnName = headerRow[index].trim().toLowerCase();
      // Simply map the fields to the right variables by their column header
      switch (columnName) {
        case 'datum':
          datum = content;
          break;
        case 'uhrzeit': {
          const timeParts = content.split('Uhr')[0].split(' - ');
          uhrzeitStart = timeParts[0].trim();
          uhrzeitEnde = timeParts[1].trim();
          break;
        }
        case 'veranstaltung':
          // remove I- prefix from name if exists
          veranstaltung = content.replace(/^I-/, '');
          break;
        case 'dozent':
          dozent = content;
          break;
        case 'raum':
          raum = content;
          break;
        case 'anmerkung':
          anmerkung = content;
          break;
        default:
          break;
      }
    });

    const times = parseTimes(datum, uhrzeitStart, uhrzeitEnde, [
      NUMERIC_DATE_FORMAT,
      LONG_DATE_FORMAT,
    ]);
    if (!times) {
      return;
    }

    events.push({
      info: anmerkung,
      room: raum,
      lecturer: dozent,
      title: veranstaltung,
      ...times,
    });
  });

  return events;
}

export function parseSkedGraphical(
  html: string,
  faculty: string,
): ParsedLecture[] {
  const $ = load(html);
  const events = [] as ParsedLecture[];

  $('body table').each(function () {
    let cols = parseTable(
      load(this),
      true,
      true,
      false,
      faculty === 'Maschinenbau',
    );

    cols = cols.filter((c) => c[0].length > 0); // filter pseudo columns -> first entry is not date string
    cols = cols.map((col) =>
      col.filter(
        (text) =>
          !/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/g.test(text) && // filter time entries
          text.length > 1 && // filter empty entries and empty tags -> 1
          !text.startsWith('['),
      ),
    ); // filter footnotes
    cols = cols.filter((col) => col.length > 1); // filter empty
    cols = cols.map((col) => [...new Set(col)]); // filter duplicates
    cols = cols.map((col) =>
      col.map((text) =>
        text
          .replace(/<span.+>.+<\/span>/g, '') // remove <span>
          .replace(/\s\[\d+\]/g, ''),
      ),
    ); // replace footnote links: e.g. [1]

    cols.forEach((col) => {
      // eslint-disable-next-line complexity
      col.forEach((entry, index) => {
        if (index === 0) {
          // is date
          return;
        }
        const datum = col[0].split(', ')[1];
        const parts = entry
          .split('<br>')
          .map((part) => part.replace(/<a.+>(.+)<\/a>/, '$1'));
        if (parts.length < 3) {
          // Should at least have time & name, otherwise no valid column
          return;
        }
        const time = parts[0].split('Uhr')[0].split(' - ');
        let uhrzeitStart = time[0];
        let uhrzeitEnde = time[1];

        let dozent = '';
        let veranstaltung: string;
        let raum = '';
        let anmerkung = '';

        switch (faculty) {
          case 'Versorgungstechnik':
            dozent = parts[1];
            veranstaltung = parts[2];
            raum = parts[3];
            anmerkung = parts.splice(4).join(', ') || '';
            break;
          case 'Recht':
            dozent = parts[3];
            veranstaltung = parts[2] + ' ' + parts[1];
            raum = parts[4];
            anmerkung = parts.splice(5).join(', ') || '';
            break;
          case 'Bau-Wasser-Boden':
            dozent = parts[3];
            veranstaltung = parts[2];
            raum = parts[4];
            anmerkung = parts[1];
            break;
          case 'Handel und Soziale Arbeit':
            veranstaltung = parts[1] || '';
            dozent = parts[2] || '';
            raum = parts[3] || '';
            anmerkung = parts.slice(4).join(', ') || '';
            break;
          case 'Wirtschaft':
            // Leider ohne Dozent / Raum, da die Zeilen in dieser Fakultät zu unterschiedlich genutzt werden
            veranstaltung = parts[1];
            break;
          case 'Soziale Arbeit':
            if (parts[0].endsWith('Uhr')) {
              parts.shift(); // remove first uhrzeit entry
            }
            while (
              parts[0] !== undefined &&
              !parts[0].startsWith('S-') &&
              !parts[0].startsWith('Ringveranstaltung')
            ) {
              anmerkung += parts.shift() + ', ';
            }
            veranstaltung = parts.shift() ?? '';
            if (parts.length >= 3) {
              anmerkung += parts.shift() + ', ';
              dozent = parts.shift() ?? '';
              raum = parts.pop() ?? '';
            }
            anmerkung += parts.join(', ') || '';
            anmerkung = anmerkung.replace(/(, ?)+$/, ''); // remove trailing ,

            // einige veranstaltungen enthalten den dozenten im titel
            veranstaltung = veranstaltung
              .replace(` - ${dozent}`, '')
              .replace(` ${dozent}`, '');
            break;
          case 'Fahrzeugtechnik': {
            // room, start, end, lecturer, title - room or lecturer may be missing
            const fields = [...parts];
            raum = /^\d?\d:\d\d$/.test(fields[0]) ? '' : (fields.shift() ?? '');
            uhrzeitStart = fields.shift() ?? '';
            uhrzeitEnde = fields.shift() ?? '';
            veranstaltung = fields.pop() ?? '';
            dozent = fields.join(', ');
            break;
          }
          case 'Gesundheitswesen':
          case 'Verkehr-Sport-Tourismus-Medien':
          case 'Elektro- und Informationstechnik':
          case 'Maschinenbau':
            if (parts.length === 3) {
              // some special handling for faculty E entries
              veranstaltung = parts[1];
              raum = parts[2];
            } else {
              dozent = parts[2];
              veranstaltung = parts[1];
              raum = parts[3];
              anmerkung = parts.splice(4).join(', ') || '';
            }
            break;
          default:
            console.log('No parser defined for faculty ' + faculty);
            throw new Error('This faculty is not supported.');
        }

        const times = parseTimes(datum, uhrzeitStart, uhrzeitEnde);
        // entries without a title are kept: a broken event tells users to check the original plan
        if (!times) {
          return;
        }

        events.push({
          info: anmerkung || '',
          room: raum || '',
          lecturer: dozent || '',
          title: veranstaltung ?? '',
          ...times,
        });
      });
    });
  });

  return events;
}

export function parseTimetableIntranet(html: string): ParsedLecture[] {
  const $ = load(html);
  const days = $('table.schedule');
  const events = [] as ParsedLecture[];
  days.each(function (index, day) {
    const date = ($(day).find('.day').html() ?? '').split('<br>')[1];

    $(day)
      .find('.day-event')
      .each(function (i, event) {
        const styleTopString = $(event).css('top') ?? '';
        const styleHeightString = $(event).css('height') ?? '';
        const styleUsesPercentage = styleTopString.includes('%');
        let startTimeSince8: number | undefined;
        let endTimeSince8: number | undefined;
        if (styleUsesPercentage) {
          // 0% = 8:00, 100% = 20:00
          const styleTop = parseFloat(styleTopString);
          const styleHeight = parseFloat(styleHeightString);
          startTimeSince8 = (styleTop / 100) * 12 * 60;
          endTimeSince8 = ((styleTop + styleHeight) / 100) * 12 * 60;
        } else {
          const styleTop = parseInt(styleTopString);
          const styleHeight = parseInt(styleHeightString);

          // timetable starts at 8:00
          // 100px height = 60 minutes
          startTimeSince8 = (styleTop / 100) * 60;
          endTimeSince8 = ((styleTop + styleHeight) / 100) * 60;
        }

        if (startTimeSince8 === undefined || endTimeSince8 === undefined) {
          throw new Error('Invalid time styles');
        }

        // e.g. 105 minutes after 8:00 -> "9:45"
        const timeOfDay = (minutesSince8: number) =>
          `${8 + Math.floor(minutesSince8 / 60)}:${Math.floor(minutesSince8 % 60)}`;

        const title = $(event).find('.text').text();
        const room = $(event).find('.rooms').text();

        const times = parseTimes(
          date,
          timeOfDay(startTimeSince8),
          timeOfDay(endTimeSince8),
        );
        if (!times) {
          throw new Error(`Invalid date ${date}`);
        }

        events.push({
          info: '',
          room,
          lecturer: '',
          title,
          ...times,
        });
      });
  });

  return events;
}
