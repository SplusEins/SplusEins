import { getOSMRoom } from './RoomOSMData';
import { FacultyLocation } from './RoomLocationApi';

/**
 * Creates an OSM link for the given room if available.
 * IndoorEqual currently does not support links to specific rooms, so we center the map on the room's location.
 * Example: https://indoorequal.org/#map=20/52.1766869/10.5484767&level=0
 */
export function createOSMLink(
  room: string,
  facultyLocation: FacultyLocation,
): string | null {
  const osmData = getOSMRoom(room, facultyLocation);
  if (!osmData) return null;

  const avgLat = (osmData.bounds.minlat + osmData.bounds.maxlat) / 2;
  const avgLon = (osmData.bounds.minlon + osmData.bounds.maxlon) / 2;

  return `https://indoorequal.org/#map=20/${avgLat}/${avgLon}&level=${osmData.level}`;
}
