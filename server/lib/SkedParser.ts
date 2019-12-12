import { load } from 'cheerio';
import * as moment from 'moment';
import { ParsedLecture } from '../model/SplusModel';

export default function parseSked(html: string, filterWeek: number) {
  const $ = load(html);

  const events = [];
  let lastDatum = '';
  $('body table.tbl tbody tr[class^="tr"]').each(function() {
    const cols = $(this).children('td').get()
      .map(col => $(col).text().replace('-', '').trim());
    const datum = cols[0] || lastDatum;
    const uhrzeit_0 = cols[2];
    const uhrzeit_1 = cols[3];
    const veranstaltung = cols[5];
    const dozent = cols[7];
    const raum = cols[9];
    const anmerkung = cols[11];

    lastDatum = datum;

    const dateFormat = 'DD.MM.YYYY H:m'
    const start = moment(datum + ' ' + uhrzeit_0, dateFormat);
    const end = moment(datum + ' ' + uhrzeit_1, dateFormat);

    if (start.isoWeek() != filterWeek % 52) {
      return;
    }

    events.push({
      info: anmerkung,
      room: raum,
      lecturer: dozent,
      title: veranstaltung,
      start: start.toDate(),
      end: end.toDate(),
      duration: end.diff(start, 'hours', true),
    } as ParsedLecture);
  });

  return events;
}
