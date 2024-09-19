import { load } from 'cheerio';
import * as moment from 'moment-timezone';
import { ParsedLecture } from '../model/SplusModel';
import parseTable from './parseTable';
import * as CSV from 'csv-string';

moment.locale('de');

export function parseSkedList (html: string): ParsedLecture[] {
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
    const cols = $(this).children('td').get()
      .map(col => $(col).text().replace(/-\s*$/, '').trim());

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
        break
      case 15:
        datum = cols[0] || lastDatum;
        uhrzeitStart = cols[2];
        uhrzeitEnde = cols[3];
        veranstaltung = cols[5];
        dozent = cols[7];
        raum = cols[9];
        anmerkung = cols[13];
        break
      case 17:
        datum = cols[5] || lastDatum;
        uhrzeitStart = cols[0];
        uhrzeitEnde = cols[1];
        veranstaltung = cols[7];
        dozent = cols[3];
        raum = cols[9];
        anmerkung = cols[15];
        break
      default:
        /**
         * Does not mean that an error occured.
         * Possibly a wrong row is parsed.
         */
        return
    }

    lastDatum = datum;

    let start = null;
    let end = null;
    for (const format of ['DD.MM.YYYY H:m', 'LLL YYYY H:m']) {
      start = moment.tz(datum + ' ' + uhrzeitStart, format, 'Europe/Berlin');
      end = moment.tz(datum + ' ' + uhrzeitEnde, format, 'Europe/Berlin');
      if (start.isValid() && end.isValid()) {
        break;
      }
    }

    if (!start.isValid() || !end.isValid()) {
      return;
    }

    events.push({
      info: anmerkung,
      room: raum,
      lecturer: dozent,
      title: veranstaltung.replace(/^I-/, ''),
      start: start.utc().toDate(),
      end: end.utc().toDate(),
      duration: end.diff(start, 'hours', true)
    } as ParsedLecture);
  });

  return events;
}

export function parseSkedCSV (csvString: string): ParsedLecture[] {
  const events = [] as ParsedLecture[];

  const arr = CSV.parse(csvString);
  // Pop the first row from the array since it contains the header strings
  const headerRow = arr.shift();

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
          const timeParts = content.split('Uhr')[0].split(' - ')
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

    let start = null;
    let end = null;
    for (const format of ['DD.MM.YYYY H:m', 'LLL YYYY H:m']) {
      start = moment.tz(datum + ' ' + uhrzeitStart, format, 'Europe/Berlin');
      end = moment.tz(datum + ' ' + uhrzeitEnde, format, 'Europe/Berlin');
      if (start.isValid() && end.isValid()) {
        break;
      }
    }
    if (!start.isValid() || !end.isValid()) {
      return;
    }

    events.push({
      info: anmerkung,
      room: raum,
      lecturer: dozent,
      title: veranstaltung,
      start: start.utc().toDate(),
      end: end.utc().toDate(),
      duration: end.diff(start, 'hours', true)
    } as ParsedLecture);
  });

  return events;
}

export function parseSkedGraphical (html: string, faculty: string): ParsedLecture[] {
  const $ = load(html);
  const events = [] as ParsedLecture[];

  $('body table').each(function () {
    let cols = parseTable(load(this, { decodeEntities: false }), true, true, false)

    cols = cols.filter(c => c[0].length > 0) // filter pseudo columns -> first entry is not date string
    cols = cols.map(col => col.filter(text =>
      !new RegExp('^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$', 'g').test(text) && // filter time entries
        text.length > 1 && // filter empty entries and empty tags -> 1
        !text.startsWith('['))) // filter footnotes
    cols = cols.filter(col => col.length > 1) // filter empty
    cols = cols.map(col => [...new Set(col)]) // filter duplicates
    cols = cols.map(col => col.map(text => text
      .replace(/<span.+>.+<\/span>/g, '') // remove <span>
      .replace(/\s\[\d+\]/g, ''))); // replace footnote links: e.g. [1]

    cols.forEach(col => {
      col.forEach((entry, index) => {
        if (index == 0) {
          // is date
          return;
        }
        const datum = col[0].split(', ')[1]
        const parts = entry.split('<br>').map(part => part.replace(/<a.+>(.+)<\/a>/, '$1'));
        if (parts.length < 3) {
          // Should at least have time & name, otherwise no valid column
          return;
        }
        const time = parts[0].split('Uhr')[0].split(' - ')
        let uhrzeitStart = time[0];
        let uhrzeitEnde = time[1];

        let dozent = ''
        let veranstaltung = ''
        let raum = ''
        let anmerkung = ''

        switch (faculty) {
          case 'Versorgungstechnik':
            dozent = parts[1];
            veranstaltung = parts[2];
            raum = parts[3]
            anmerkung = parts.splice(4).join(', ') || ''
            break;
          case 'Recht':
            dozent = parts[3];
            veranstaltung = parts[2] + ' ' + parts[1];
            raum = parts[4]
            anmerkung = parts.splice(5).join(', ') || ''
            break;
          case 'Bau-Wasser-Boden':
            dozent = parts[3];
            veranstaltung = parts[2];
            raum = parts[4]
            anmerkung = parts[1];
            break;
          case 'Handel und Soziale Arbeit':
            // Leider ohne Dozent / Raum, da die Zeilen in dieser Fakultät zu unterschiedlich genutzt werden
            veranstaltung = parts[2];
            anmerkung = parts[1];
            break;
          case 'Wirtschaft':
            // Leider ohne Dozent / Raum, da die Zeilen in dieser Fakultät zu unterschiedlich genutzt werden
            veranstaltung = parts[1];
            break;
          case 'Soziale Arbeit':
            parts.shift() // remove first uhrzeit entry
            while (parts[0] !== undefined && !parts[0].startsWith('S-')) {
              anmerkung += parts.shift() + ', '
            }
            veranstaltung = parts.shift();
            anmerkung += parts.shift() + ', '
            dozent = parts.shift();
            raum = parts.pop();
            anmerkung += parts.join(', ') || ''
            anmerkung = anmerkung.replace(/(, ?)+$/, ''); // remove trailing ,

            // einige veranstaltungen enthalten den dozenten im titel
            veranstaltung = veranstaltung.replace(` - ${dozent}`, '').replace(` ${dozent}`, '')
            break;
          case 'Fahrzeugtechnik':
            raum = parts[0];
            uhrzeitStart = parts[1];
            uhrzeitEnde = parts[2];
            dozent = parts[3];
            veranstaltung = parts[4];
            break;
          case 'Gesundheitswesen':
          case 'Verkehr-Sport-Tourismus-Medien':
          case 'Elektrotechnik':
            if (parts.length === 3) {
              // some special handling for faculty E entries
              veranstaltung = parts[1];
              raum = parts[2];
            } else {
              dozent = parts[2];
              veranstaltung = parts[1];
              raum = parts[3]
              anmerkung = parts.splice(4).join(', ') || ''
            }
            break;
          default:
            console.log('No parser defined for faculty ' + faculty)
            throw new Error('This faculty is not supported.');
        }

        const dateFormat = 'DD.MM.YYYY H:m'
        const start = moment.tz(datum + ' ' + uhrzeitStart, dateFormat, 'Europe/Berlin');
        const end = moment.tz(datum + ' ' + uhrzeitEnde, dateFormat, 'Europe/Berlin');
        if (!start.isValid() || !end.isValid() || veranstaltung === '') {
          return;
        }

        events.push({
          info: anmerkung || '',
          room: raum || '',
          lecturer: dozent || '',
          title: veranstaltung || '',
          start: start.utc().toDate(),
          end: end.utc().toDate(),
          duration: end.diff(start, 'hours', true)
        } as ParsedLecture);
      })
    })
  });

  return events;
}
