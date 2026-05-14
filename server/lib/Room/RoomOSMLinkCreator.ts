import * as OSM_ROOMS_DATA_WF from '../../assets/overpass_osm/WF.json';
import * as OSM_ROOMS_DATA_SZ from '../../assets/overpass_osm/SZ.json';
import * as OSM_ROOMS_DATA_WOB from '../../assets/overpass_osm/WOB.json';
import * as OSM_ROOMS_DATA_SUD from '../../assets/overpass_osm/SUD.json';

import { FacultyLocation } from './RoomLocationApi';

type OSMRoomData = {
  id: number;
  level: string;
  bounds: {
    minlat: number;
    minlon: number;
    maxlat: number;
    maxlon: number;
  };
};

/**
 * Type guard to check if data has the correct OSM room structure
 */
function isOSMRoomData(data: unknown): data is OSMRoomData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'level' in data &&
    'bounds' in data &&
    typeof (data as Record<string, unknown>).id === 'number' &&
    typeof (data as Record<string, unknown>).level === 'string' &&
    typeof (data as Record<string, unknown>).bounds === 'object' &&
    (data as Record<string, unknown>).bounds !== null
  );
}

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
  let osmData: OSMRoomData | null = null;

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
   *
   * If we do, create the OSM link using the ID
   * Example: Link: https://indoorequal.org/#map=19.54/52.1766869/10.5484767&level=0&poi=way:1445466532
   *
   * IndoorEqual currently does not support links to specific rooms, so we will center the map on the room's location.
   * This will not show a maker for the room, but it will at least show the correct area of the building.
   */
  if (isOSMRoomData(osmData)) {
    const level = osmData.level;
    // Calculate the average latitude and longitude for the room's bounding box
    // This will center the map on the room when the link is opened
    const avgLat = (osmData.bounds.minlat + osmData.bounds.maxlat) / 2;
    const avgLon = (osmData.bounds.minlon + osmData.bounds.maxlon) / 2;

    // Construct the OSM link using the calculated values { 20: zoom level, avgLat: average latitude, avgLon: average longitude, level: room level }
    return `https://indoorequal.org/#map=20/${avgLat}/${avgLon}&level=${level}`;
  }

  return null;
}
