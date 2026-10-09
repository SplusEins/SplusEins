import * as OSM_ROOMS_DATA_WF from '../../assets/overpass_osm/WF.json';
import * as OSM_ROOMS_DATA_SZ from '../../assets/overpass_osm/SZ.json';
import * as OSM_ROOMS_DATA_WOB from '../../assets/overpass_osm/WOB.json';
import * as OSM_ROOMS_DATA_SUD from '../../assets/overpass_osm/SUD.json';
import * as ROOM_ALIASES from '../../assets/roomAliases.json';

import { FacultyLocation } from './RoomLocationApi';

export type OSMRoomEntry = {
  id: number;
  level: string;
  'building:name'?: string | null;
  'building:addr'?: string | null;
  bounds: {
    minlat: number;
    minlon: number;
    maxlat: number;
    maxlon: number;
  };
};

/**
 * Type guard: the json gets pulled automatically from overpass,
 * so make sure invalid data doesn't break the system.
 */
function isOSMRoomData(data: unknown): data is OSMRoomEntry {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.id === 'number' &&
    typeof d.level === 'string' &&
    typeof d.bounds === 'object' &&
    d.bounds !== null
  );
}

/**
 * Returns the validated OSM entry for a room (aliases are resolved) or null.
 */
export function getOSMRoom(
  room: string,
  facultyLocation: FacultyLocation,
): OSMRoomEntry | null {
  room = ROOM_ALIASES[room] ?? room;

  let osmData: unknown = null;
  switch (facultyLocation) {
    case 'WF':
      osmData = OSM_ROOMS_DATA_WF?.[room];
      break;
    case 'SZ':
      osmData = OSM_ROOMS_DATA_SZ?.[room];
      break;
    case 'WOB':
      osmData = OSM_ROOMS_DATA_WOB?.[room];
      break;
    case 'SUD':
      osmData = OSM_ROOMS_DATA_SUD?.[room];
      break;
  }

  return isOSMRoomData(osmData) ? osmData : null;
}
