import { load } from 'cheerio';
import * as moment from 'moment-timezone';
import { ParsedLecture } from '../model/SplusModel';
import parseTable from './parseTable';

moment.locale('de');

export function parseSkedList (html: string): ParsedLecture[] {
  const $ = load(html);

  const events = [] as ParsedLecture[];

  let lastDatum = '';
  let datum = '';
  let uhrzeit_0 = '';
  let uhrzeit_1 = '';
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
        uhrzeit_0 = cols[4];
        uhrzeit_1 = cols[5];
        dozent = cols[7];
        veranstaltung = cols[9];
        anmerkung = '';
        break;
      case 13:
        datum = cols[0] || lastDatum;
        uhrzeit_0 = cols[2];
        uhrzeit_1 = cols[3];
        veranstaltung = cols[5];
        dozent = cols[7];
        raum = cols[9];
        anmerkung = cols[11];
        break
      case 15:
        datum = cols[0] || lastDatum;
        uhrzeit_0 = cols[2];
        uhrzeit_1 = cols[3];
        veranstaltung = cols[5];
        dozent = cols[7];
        raum = cols[9];
        anmerkung = cols[13];
        break
      case 17:
        datum = cols[5] || lastDatum;
        uhrzeit_0 = cols[0];
        uhrzeit_1 = cols[1];
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
      start = moment.tz(datum + ' ' + uhrzeit_0, format, 'Europe/Berlin');
      end = moment.tz(datum + ' ' + uhrzeit_1, format, 'Europe/Berlin');
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
      start: start.toDate(),
      end: end.toDate(),
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
        const parts = entry.split('<br>');
        if (parts.length < 3) {
          // Should at least have time & name, otherwise no valid column
          return;
        }
        const time = parts[0].split('Uhr')[0].split(' - ')
        const uhrzeit_0 = time[0];
        const uhrzeit_1 = time[1];

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
            // Sometimes has the room in the second row and sometimes not.
            // This regex detects it based on the fact that it either starts with digits and only has non whitespace chars until EOL or next comma
            // or it starts with 1-3 letters followed by digits and non whitespace chars.
            if (parts[1].match(/^\w{0,3}\d+\S*(,|$)/)) {
              dozent = parts[3];
              veranstaltung = parts[2];
              raum = parts[1]
              anmerkung = parts.splice(4).join(', ') || ''
            } else {
              dozent = parts[2];
              veranstaltung = parts[1];
              anmerkung = parts.splice(3).join(', ') || ''
            }
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
          case 'Fahrzeugtechnik':
          case 'Gesundheitswesen':
          case 'Soziale Arbeit':
          case 'Verkehr-Sport-Tourismus-Medien':
          case 'Elektrotechnik':
            dozent = parts[2];
            veranstaltung = parts[1];
            raum = parts[3]
            anmerkung = parts.splice(4).join(', ') || ''
            break;
          default:
            console.log('No parser defined for faculty ' + faculty)
            throw new Error('This faculty is not supported.');
            break;
        }

        const dateFormat = 'DD.MM.YYYY H:m'
        const start = moment.tz(datum + ' ' + uhrzeit_0, dateFormat, 'Europe/Berlin');
        const end = moment.tz(datum + ' ' + uhrzeit_1, dateFormat, 'Europe/Berlin');

        if (!start.isValid() || !end.isValid()) {
          return;
        }

        events.push({
          info: anmerkung || '',
          room: raum || '',
          lecturer: dozent || '',
          title: veranstaltung || '',
          start: start.toDate(),
          end: end.toDate(),
          duration: end.diff(start, 'hours', true)
        } as ParsedLecture);
      })
    })
  });

  return events;
}
