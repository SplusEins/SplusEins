import LOCATION_OF_FACULTY_JSON from '../../assets/locationOfFaculty.json';

import { createRoomAddress } from './RoomAddressCreator';
import { createOSMLink } from './RoomOSMLinkCreator';

/**
 * Make sure in the locationOfFaculty.json the values are only of the following types:
 * 'WF'  -> (Wolfenbüttel)
 * 'WOB' -> (Wolfsburg)
 * 'SZ'  -> (Salzgitter)
 * 'SUD' -> (Suderburg)
 */
export type FacultyLocation = 'WF' | 'WOB' | 'SZ' | 'SUD';

const LOCATION_OF_FACULTY: Record<string, string> = LOCATION_OF_FACULTY_JSON;
const FACULTY_LOCATIONS: FacultyLocation[] = ['WF', 'WOB', 'SZ', 'SUD'];

const isFacultyLocation = (location?: string): location is FacultyLocation =>
  FACULTY_LOCATIONS.some((facultyLocation) => facultyLocation === location);

export function getRoomLocation(room: string, faculty: string): string {
  let result = room;

  // Determine faculty location
  const location = LOCATION_OF_FACULTY[faculty];
  const facultyLocation = isFacultyLocation(location) ? location : null;

  // Add address and OSM link if faculty location is known
  const address = facultyLocation
    ? createRoomAddress(room, facultyLocation)
    : null;
  if (address) {
    result += ` (${address})`;
  }
  const osmLink = facultyLocation ? createOSMLink(room, facultyLocation) : null;
  if (osmLink) {
    result += ` Link: ${osmLink}`;
  }

  return result;
}

export function getLectureRoomLocations(
  rooms: string[],
  faculty: string,
): string {
  const locations = rooms.map((room) => getRoomLocation(room.trim(), faculty));
  return locations.join(' / ');
}
