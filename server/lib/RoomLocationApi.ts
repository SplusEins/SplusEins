import * as OSM_ROOMS_DATA from '../assets/overpassOSMRoomsData.json';

export function getRoomLocation(room: string) {
  let result = room;

  /**
   * If the room starts with WF-EX-, it is at the Am Exer address
   * E. g. WF-EX-2/252 -> Am Exer 2, Am Exer 2, 38302 Wolfenbüttel
   * Regex explanation:
   * ^WF-EX-     : Room starts with WF-EX-
   * (\d+)       : Capture building number (one or more digits) -> this is used for the street number
   */
  const exerRegexMatch = /^WF-EX-(\d+)/.exec(room);

  // match rooms of the main address, https://regex101.com/r/krwu5H/1
  const mainRegexMatch = /^([A-FL]\d{3})\s+(.+)/.exec(room);

  if (exerRegexMatch) {
    const buildingNumber = exerRegexMatch ? exerRegexMatch[1] : '';
    result += ` (Am Exer ${buildingNumber}, 38302 Wolfenbüttel)`;
  } else if (mainRegexMatch) {
    result += ' (Salzdahlumer Str. 46/48, 38302 Wolfenbüttel)';
  }

  /**
   * Check if we have OSM data for this room
   * If so, add a link to the OSM way
   * Example: Link: https://www.osmapp.org/way/123456789
   */
  const osmData = OSM_ROOMS_DATA[room];
  if (osmData) {
    result += ` Link: https://www.osmapp.org/way/${osmData.id}`;
  }

  return result;
}

export function getLectureRoomsLocation(rooms: string[]) {
  const locations = rooms.map(room => getRoomLocation(room.trim()));
  return locations.join(' / ');
}
