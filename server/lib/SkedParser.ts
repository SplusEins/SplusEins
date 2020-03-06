import { load } from 'cheerio';
import * as moment from 'moment-timezone';
import { ParsedLecture } from '../model/SplusModel';
import parseTable from './parseTable';

export function parseSkedList(html: string, filterWeek: number) {
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
  $('body table.tbl tbody tr[class^="tr"]').each(function() {
    const cols = $(this).children('td').get()
      .map(col => $(col).text().replace(/-\s*$/, '').trim());

    switch(cols.length) {
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
        const msg = 'No suitable parser for sked list plan found!'
        console.error(msg)
        throw new Error(msg)
    }

    lastDatum = datum;

    const dateFormat = 'DD.MM.YYYY H:m'
    const start = moment.tz(datum + ' ' + uhrzeit_0, dateFormat, 'Europe/Berlin');
    const end = moment.tz(datum + ' ' + uhrzeit_1, dateFormat, 'Europe/Berlin');

    if (start.isoWeek() != filterWeek % 52) {
      return;
    }

    events.push({
      info: anmerkung,
      room: raum,
      lecturer: dozent,
      title: veranstaltung.replace(/^I-/, ''),
      start: start.toDate(),
      end: end.toDate(),
      duration: end.diff(start, 'hours', true),
    } as ParsedLecture);
  });

  return events;
}

export function parseSkedGraphical(html: string, filterWeek: number, faculty: string) {
  const $ = load(html);
  const events = [] as ParsedLecture[];

  $('body table').each(function() {
    let cols = parseTable(load(this, {decodeEntities: false}), true, true, false)

    cols = cols.filter(c => c[0].length > 0) // filter pseudo columns -> first entry is not date string
    cols = cols.map(col => col.filter(text =>
        !new RegExp('^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$', 'g').test(text) && // filter time entries
        text.length > 1 && // filter empty entries and empty tags -> 1
        !text.startsWith('['))) // filter footnotes
    cols = cols.filter(col => col.length > 1) // filter empty
    cols = cols.map(col => [... new Set(col)]) // filter duplicates
    cols = cols.map(col => col.map(text => text
        .replace(/<span.+>.+<\/span>/g, '') // remove <span>
        .replace(/\s\[\d+\]/g, ''))); // replace footnote links: e.g. [1]

    cols.forEach(col => {
      col.forEach((entry, index) => {
        if(index == 0) {
          // is date
          return;
        }
        const datum = col[0].split(', ')[1]
        const parts = entry.split('<br>');
        const time = parts[0].replace('Uhr', '').split(' - ')
        const uhrzeit_0 = time[0];
        const uhrzeit_1 = time[1];

        let dozent = ''
        let veranstaltung = ''
        let raum = ''
        let anmerkung = ''

        switch(faculty) {
          case 'Versorgungstechnik':
            dozent = parts[1];
            veranstaltung = parts[2];
            raum = parts[3]
            anmerkung = parts.splice(4).join(', ') || ''
            break;
          case 'Recht':
            dozent = parts[3];
            veranstaltung = parts[2];
            raum = parts[1]
            anmerkung = parts.splice(4).join(', ') || ''
            break;
          case 'Bau-Wasser-Boden':
              dozent = parts[3];
              veranstaltung = parts[2];
              raum = parts[4]
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
        }


        const dateFormat = 'DD.MM.YYYY H:m'
        const start = moment.tz(datum + ' ' + uhrzeit_0, dateFormat, 'Europe/Berlin');
        const end = moment.tz(datum + ' ' + uhrzeit_1, dateFormat, 'Europe/Berlin');

        if (start.isoWeek() != filterWeek % 52) {
          return;
        }

        events.push({
          info: anmerkung || '',
          room: raum || '',
          lecturer: dozent || '',
          title: veranstaltung || '',
          start: start.toDate(),
          end: end.toDate(),
          duration: end.diff(start, 'hours', true),
        } as ParsedLecture);

      })
    })
  });

  return events;
}
