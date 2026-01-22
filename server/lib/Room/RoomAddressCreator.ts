import { FacultyLocation } from './RoomLocationApi';

/**
 * Creates the address string of the building containing the given room.
 * The function is based on the faculty location the room belongs to.
 * This is the case because some Rooms in different locations have the same name.
 * @param room name
 * @param facultyLocation location of the faculty the room belongs to
 * @returns Full address string including street, postal code and city if available. Null if room is unknown.
 */
export function createRoomAddress(
  room: string,
  facultyLocation: FacultyLocation,
): string | null {
  switch (facultyLocation) {
    case 'WF':
      return createRoomAddressWolfenbuettel(room);
    default:
      return null;
  }
}

/**
 * In Wolfenbüttel, rooms either belong to the Am Exer address or the main building address.
 * If the room is at Am Exer, there are multiple buildings, which are identified by the building number in the room name.
 * @param room name
 * @returns the address string (see createRoomAddress) for Wolfenbüttel faculty rooms or null if room is unknown
 */
function createRoomAddressWolfenbuettel(room: string): string | null {
  /**
   * If the room ref starts with WF-EX-, it is at the Am Exer address
   * E. g. WF-EX-2/252 -> Am Exer 2, Am Exer 2, 38302 Wolfenbüttel
   * Regex explanation:
   * ^WF-EX-     : Room starts with WF-EX-
   * (\d+)       : Capture building number (one or more digits) -> this is used for the street number
   */
  const exerRegexMatch = /^WF-EX-(\d+)/.exec(room);

  /**
   * If the room ref starts with A, B or C followed by a digit, it is at the main building address
   * E. g. A068 -> Salzdahlumer Str. 46/48, 38302 Wolfenbüttel
   * Regex explanation:
   * ^[A-Z]      : Room starts with a capital letter A-Z
   * \d+         : followed by one or more digits
   */
  const mainRegexMatch = /^[A-Z]\d+/.exec(room);

  if (exerRegexMatch) {
    const buildingNumber = exerRegexMatch ? exerRegexMatch[1] : '';
    return `Am Exer ${buildingNumber}, 38302 Wolfenbüttel`;
  } else if (mainRegexMatch) {
    return 'Salzdahlumer Str. 46/48, 38302 Wolfenbüttel';
  }
  return null;
}
