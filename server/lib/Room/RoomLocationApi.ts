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

export interface Room {
  name: string;
  address?: string;
  /* a map centered on the room */
  url?: string;
}

export function getRoomLocation(room: string, faculty: string): Room {
  const location = LOCATION_OF_FACULTY[faculty];
  if (!isFacultyLocation(location)) return { name: room };
  return {
    name: room,
    address: createRoomAddress(room, location) ?? undefined,
    url: createOSMLink(room, location) ?? undefined,
  };
}

/**
 * @param rooms the rooms as in the timetable, e.g. 'A209, B107'
 */
export function getLectureRoomLocations(
  rooms: string,
  faculty: string,
): Room[] {
  return rooms
    .split(',')
    .map((room) => room.trim())
    .filter(Boolean)
    .map((room) => getRoomLocation(room, faculty));
}

/* e.g. 'A209, Salzdahlumer Str. 46/48, 38302 Wolfenbüttel / B107' */
export function roomsToText(rooms: Room[]): string {
  return rooms
    .map(({ name, address }) => (address ? `${name}, ${address}` : name))
    .join(' / ');
}
