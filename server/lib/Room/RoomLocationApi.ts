import * as LOCATION_OF_FACULTY from '../../assets/locationOfFaculty.json';

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

export function getRoomLocation(room: string, faculty: string): string {
  let result = room;

  // Determine faculty location
  let facultyLocation: FacultyLocation | null = null;
  if (faculty && LOCATION_OF_FACULTY[faculty]) {
    facultyLocation = LOCATION_OF_FACULTY[faculty] as FacultyLocation;
  }

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
