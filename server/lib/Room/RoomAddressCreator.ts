import { getOSMRoom } from './RoomOSMData';
import { FacultyLocation } from './RoomLocationApi';

/**
 * Creates the address string of the building containing the given room.
 * The faculty location is needed because some rooms in different locations have the same name.
 * @returns Address string (e. g. "Am Exer 11, 38302 Wolfenbüttel") or null if room/address is unknown.
 */
export function createRoomAddress(
  room: string,
  facultyLocation: FacultyLocation,
): string | null {
  return getOSMRoom(room, facultyLocation)?.['building:addr'] ?? null;
}
