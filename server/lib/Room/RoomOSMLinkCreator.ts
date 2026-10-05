import * as OSM_ROOMS_WF from '../../assets/overpass_osm/WF_rooms.json';
import * as OSM_ROOMS_SZ from '../../assets/overpass_osm/SZ_rooms.json';
import * as OSM_ROOMS_WOB from '../../assets/overpass_osm/WOB_rooms.json';
import * as OSM_ROOMS_SUD from '../../assets/overpass_osm/SUD_rooms.json';

import * as OSM_BUILDINGS_WF from '../../assets/overpass_osm/WF_buildings.json';
import * as OSM_BUILDINGS_SZ from '../../assets/overpass_osm/SZ_buildings.json';
import * as OSM_BUILDINGS_WOB from '../../assets/overpass_osm/WOB_buildings.json';
import * as OSM_BUILDINGS_SUD from '../../assets/overpass_osm/SUD_buildings.json';

import { FacultyLocation } from './RoomLocationApi';

interface OsmRoom {
  id: number;
  level: string;
  building: number;
  bounds: { minlat: number; minlon: number; maxlat: number; maxlon: number };
}

export interface OsmBuilding {
  name?: string;
  street?: string;
  housenumber?: string;
  postcode?: string;
  city?: string;
}

const ROOMS: Record<FacultyLocation, Record<string, OsmRoom>> = {
  WF: OSM_ROOMS_WF as any,
  SZ: OSM_ROOMS_SZ as any,
  WOB: OSM_ROOMS_WOB as any,
  SUD: OSM_ROOMS_SUD as any,
};

const BUILDINGS: Record<FacultyLocation, Record<string, OsmBuilding>> = {
  WF: OSM_BUILDINGS_WF as any,
  SZ: OSM_BUILDINGS_SZ as any,
  WOB: OSM_BUILDINGS_WOB as any,
  SUD: OSM_BUILDINGS_SUD as any,
};

function getRoom(room: string, facultyLocation: FacultyLocation): OsmRoom | null {
  return ROOMS[facultyLocation]?.[room] ?? null;
}

/**
 * Creates an OSM link for the given room if available.
 * Example: https://indoorequal.org/#map=19.54/52.1766869/10.5484767&level=0&poi=way:1445466532
 */
export function createOSMLink(
  room: string,
  facultyLocation: FacultyLocation,
): string | null {
  const osmData = getRoom(room, facultyLocation);
  if (!osmData) return null;

  const { minlat, maxlat, minlon, maxlon } = osmData.bounds;
  const lat = (minlat + maxlat) / 2;
  const lon = (minlon + maxlon) / 2;

  return `https://indoorequal.org/#map=19.5/${lat}/${lon}&level=${osmData.level}&poi=way:${osmData.id}`;
}

/**
 * Returns the building (name + address) a room belongs to, or null.
 */
export function getRoomBuilding(
  room: string,
  facultyLocation: FacultyLocation,
): OsmBuilding | null {
  const osmData = getRoom(room, facultyLocation);
  if (!osmData) return null;
  return BUILDINGS[facultyLocation]?.[String(osmData.building)] ?? null;
}
