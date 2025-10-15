export function getRoomLocation(room: string) {
  /**
   * If the room starts with WF-EX-, it is at the Am Exer address
   * E. g. WF-EX-2/252 -> Am Exer 2, Am Exer 2, 38302 Wolfenbüttel
   * 
   * Regex explanation:
   * ^WF-EX-     : Room starts with WF-EX-
   * (\d+)       : Capture building number (one or more digits) -> this is used for the street number
   */
  const exerRegexMatch = /^WF-EX-(\d+)/.exec(room);
  if (exerRegexMatch) {
    const buildingNumber = exerRegexMatch ? exerRegexMatch[1] : '';
    return `${room} (Am Exer ${buildingNumber}, 38302 Wolfenbüttel)`;
  }


  // match rooms of the main address, https://regex101.com/r/krwu5H/1
  const matchMain = /^([A-FL]\d{3})\s+(.+)/.exec(room);
  if (matchMain) {
    return `${room}, Salzdahlumer Str. 46/48, 38302 Wolfenbüttel, Germany`;
  }
  return room;
}

export function getLectureRoomsLocation(rooms: string[]) {
  const locations = rooms.map(room => getRoomLocation(room.trim()));
  return locations.join(' / ');
}