/**
 * https://github.com/misterparser/cheerio-tableparser/blob/master/index.js
 */

export default function parseTable($, dupCols, dupRows, textMode, estimateTimes) {
  if (dupCols === undefined) dupCols = false;
  if (dupRows === undefined) dupRows = false;
  if (textMode === undefined) textMode = false;
  if (estimateTimes === undefined) estimateTimes = false;


  let startTime;
  let timeGrid;
  if (estimateTimes) {
    let times = [];
    $('tr').each((row_idx, row) => {
      let content = $('td:first', row).html();
      // Find time labels at the side of the timetable
      if (/^\d?\d:\d\d$/g.test(content)) {
        times.push({
          index: row_idx,
          time: new Date(0, 0, 0, parseInt(content.split(':')[0]), parseInt(content.split(':')[1]), 0)
        });
      }
    });
    // Calculate row length in minutes and start time of the timetable
    timeGrid = (times[1].time - times[0].time) / (times[1].index - times[0].index) / (60 * 1000);
    startTime = addMinutes(times[0].time, -1 * timeGrid * times[0].index);
  }

  const columns = [];
  let curr_x = 0;
  let curr_y = 0;
  $('tr').each(function (row_idx, row) {
    curr_y = 0;
    $('td, th', row).each(function (col_idx, col) {
      const rowspan = $(col).attr('rowspan') || 1;
      const colspan = $(col).attr('colspan') || 1;
      let content;
      if (textMode === true) {
        content = $(col).text().trim() || '';
      } else {
        content = $(col).html() || '';

        if (estimateTimes) {
          // Add time string to html if cell is an event and has no time
          if (!/\d?\d:\d\d - \d?\d:\d\d Uhr<br>.*/gm.test(content) && $(col).text().trim() != "" && !/\d?\d:\d\d/gm.test($(col).text().trim()) && !/.., \d\d\.\d\d\.\d\d\d\d/gm.test($(col).text().trim())) {
            content = addMinutes(startTime, row_idx * timeGrid).toLocaleTimeString('de-de', {
              hour: 'numeric',
              minute: '2-digit',
            }) + ' - ' + addMinutes(startTime, (row_idx + parseInt(rowspan)) * timeGrid).toLocaleTimeString('de-de', {
              hour: 'numeric',
              minute: '2-digit',
            }) + ' Uhr<br>' + content;
          }
        }
      }

      let x = 0;
      let y = 0;
      for (x = 0; x < rowspan; x++) {
        for (y = 0; y < colspan; y++) {
          if (columns[curr_y + y] === undefined) {
            columns[curr_y + y] = [];
          }

          while (columns[curr_y + y][curr_x + x] !== undefined) {
            curr_y += 1;
            if (columns[curr_y + y] === undefined) {
              columns[curr_y + y] = [];
            }
          }

          if ((x === 0 || dupRows) && (y === 0 || dupCols)) {
            columns[curr_y + y][curr_x + x] = content;
          } else {
            columns[curr_y + y][curr_x + x] = '';
          }
        }
      }
      curr_y += 1;
    });
    curr_x += 1;
  });

  return columns;
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}
