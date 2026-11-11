/**
 * https://github.com/misterparser/cheerio-tableparser/blob/master/index.js
 */
import { CheerioAPI } from 'cheerio';

const TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: 'numeric',
  minute: '2-digit',
};

/**
 * Convert a HTML table into columns of cell contents.
 *
 * @param $ the table
 * @param dupCols repeat the content of cells which span several columns
 * @param dupRows repeat the content of cells which span several rows
 * @param textMode return the text instead of the HTML of the cells
 * @param estimateTimes add the times to cells without times, based on the time labels at the side of the table
 * @returns columns[x][y]
 */
export default function parseTable(
  $: CheerioAPI,
  dupCols = false,
  dupRows = false,
  textMode = false,
  estimateTimes = false,
): string[][] {
  let startTime: Date | undefined;
  let timeGrid: number | undefined;
  if (estimateTimes) {
    const times: { index: number; time: Date }[] = [];
    $('tr').each((rowIndex, row) => {
      const content = $('td:first', row).html() ?? '';
      // Find time labels at the side of the timetable
      if (/^\d?\d:\d\d$/g.test(content)) {
        const [hours, minutes] = content.split(':').map((x) => parseInt(x));
        times.push({
          index: rowIndex,
          time: new Date(0, 0, 0, hours, minutes),
        });
      }
    });
    // Calculate row length in minutes and start time of the timetable
    if (times.length >= 2) {
      timeGrid =
        (times[1].time.getTime() - times[0].time.getTime()) /
        (times[1].index - times[0].index) /
        (60 * 1000);
      startTime = addMinutes(times[0].time, -1 * timeGrid * times[0].index);
    }
  }

  const columns: string[][] = [];
  let currX = 0;
  let currY = 0;
  $('tr').each(function (rowIndex, row) {
    currY = 0;
    $('td, th', row).each(function (_, col) {
      const rowspan = parseInt($(col).attr('rowspan') || '1');
      const colspan = parseInt($(col).attr('colspan') || '1');
      let content: string;
      if (textMode) {
        content = $(col).text().trim();
      } else {
        content = $(col).html() || '';
        const text = $(col).text().trim();

        // Add time string to html if cell is an event and has no time
        if (
          estimateTimes &&
          text !== '' &&
          !/\d?\d:\d\d/gm.test(text) &&
          !/.., \d\d\.\d\d\.\d\d\d\d/gm.test(text)
        ) {
          if (!startTime || !timeGrid) {
            // Add a blank line instead of the times if row length or start time could not be calculated
            content = '<br>' + content;
          } else {
            const start = addMinutes(startTime, rowIndex * timeGrid);
            const end = addMinutes(startTime, (rowIndex + rowspan) * timeGrid);
            content =
              start.toLocaleTimeString('de-de', TIME_FORMAT) +
              ' - ' +
              end.toLocaleTimeString('de-de', TIME_FORMAT) +
              ' Uhr<br>' +
              content;
          }
        }
      }

      for (let x = 0; x < rowspan; x++) {
        for (let y = 0; y < colspan; y++) {
          if (columns[currY + y] === undefined) {
            columns[currY + y] = [];
          }

          while (columns[currY + y][currX + x] !== undefined) {
            currY += 1;
            if (columns[currY + y] === undefined) {
              columns[currY + y] = [];
            }
          }

          if ((x === 0 || dupRows) && (y === 0 || dupCols)) {
            columns[currY + y][currX + x] = content;
          } else {
            columns[currY + y][currX + x] = '';
          }
        }
      }
      currY += 1;
    });
    currX += 1;
  });

  return columns;
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}
