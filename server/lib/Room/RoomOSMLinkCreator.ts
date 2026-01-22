import * as OSM_ROOMS_DATA_WF from '../../assets/overpass_osm/WF.json';
import * as OSM_ROOMS_DATA_SZ from '../../assets/overpass_osm/SZ.json';
import * as OSM_ROOMS_DATA_WOB from '../../assets/overpass_osm/WOB.json';
import * as OSM_ROOMS_DATA_SUD from '../../assets/overpass_osm/SUD.json';

import { FacultyLocation } from './RoomLocationApi';

/**
 * Creates an OSM link for the given room if available.
 * @param room name
 * @param facultyLocation location of the faculty the room belongs to
 * @returns OSM link for the room or null if not available
 */
export function createOSMLink(
  room: string,
  facultyLocation: FacultyLocation,
): string | null {
  let osmData: { id: number; level: string } | null = null;

  // Select the correct OSM data based on the faculty location
  switch (facultyLocation) {
    case 'WF':
      osmData = OSM_ROOMS_DATA_WF?.[room] ?? null;
      break;
    case 'SZ':
      osmData = OSM_ROOMS_DATA_SZ?.[room] ?? null;
      break;
    case 'WOB':
      osmData = OSM_ROOMS_DATA_WOB?.[room] ?? null;
      break;
    case 'SUD':
      osmData = OSM_ROOMS_DATA_SUD?.[room] ?? null;
      break;
  }

  /**
   * Check if we have OSM data for this room in the selected location
   * If we do, create the OSM link using the ID
   * Example: Link: https://osmapp.org/way/123456789
   */
  if (osmData) {
    return `https://osmapp.org/way/${osmData.id}`;
  }
  return null;
}
