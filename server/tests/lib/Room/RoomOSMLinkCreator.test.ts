// Mock OSM data
jest.mock(
  '../../../assets/overpass_osm/WF.json',
  () => ({
    'test-room': {
      id: 11111111,
      level: '0',
      bounds: { minlat: 0, minlon: 0, maxlat: 10, maxlon: 20 },
    },
  }),
  { virtual: true },
);
jest.mock(
  '../../../assets/overpass_osm/SZ.json',
  () => ({
    'test-room': {
      id: 22222222,
      level: '1',
      bounds: { minlat: 0, minlon: 0, maxlat: 30, maxlon: 40 },
    },
  }),
  { virtual: true },
);
jest.mock(
  '../../../assets/overpass_osm/SUD.json',
  () => ({
    'test-room': {
      id: 333333333,
      level: '2',
      bounds: { minlat: 0, minlon: 0, maxlat: 50, maxlon: 60 },
    },
  }),
  { virtual: true },
);
jest.mock(
  '../../../assets/overpass_osm/WOB.json',
  () => ({
    'test-room': {
      id: 444444444,
      level: '3',
      bounds: { minlat: 0, minlon: 0, maxlat: 70, maxlon: 80 },
    },
  }),
  { virtual: true },
);

describe('RoomOSMLinkCreator', () => {
  describe('WF', () => {
    it('should return correct OSM link for test-room in WF faculty', () => {
      const { createOSMLink } = require('../../../lib/Room/RoomOSMLinkCreator');
      const link = createOSMLink('test-room', 'WF');
      expect(link).toBe('https://indoorequal.org/#map=20/5/10&level=0');
    });

    it('should return null for unknown room in WF faculty', () => {
      const { createOSMLink } = require('../../../lib/Room/RoomOSMLinkCreator');
      const link = createOSMLink('UNKNOWN_ROOM', 'WF');
      expect(link).toBeNull();
    });
  });
  describe('SZ', () => {
    it('should return correct OSM link for test-room in SZ faculty', () => {
      const { createOSMLink } = require('../../../lib/Room/RoomOSMLinkCreator');
      const link = createOSMLink('test-room', 'SZ');
      expect(link).toBe('https://indoorequal.org/#map=20/15/20&level=1');
    });

    it('should return null for unknown room in SZ faculty', () => {
      const { createOSMLink } = require('../../../lib/Room/RoomOSMLinkCreator');
      const link = createOSMLink('UNKNOWN_ROOM', 'SZ');
      expect(link).toBeNull();
    });
  });
  describe('SUD', () => {
    it('should return correct OSM link for test-room in SUD faculty', () => {
      const { createOSMLink } = require('../../../lib/Room/RoomOSMLinkCreator');
      const link = createOSMLink('test-room', 'SUD');
      expect(link).toBe('https://indoorequal.org/#map=20/25/30&level=2');
    });

    it('should return null for unknown room in SUD faculty', () => {
      const { createOSMLink } = require('../../../lib/Room/RoomOSMLinkCreator');
      const link = createOSMLink('UNKNOWN_ROOM', 'SUD');
      expect(link).toBeNull();
    });
  });
  describe('WOB', () => {
    it('should return correct OSM link for test-room in WOB faculty', () => {
      const { createOSMLink } = require('../../../lib/Room/RoomOSMLinkCreator');
      const link = createOSMLink('test-room', 'WOB');
      expect(link).toBe('https://indoorequal.org/#map=20/35/40&level=3');
    });

    it('should return null for unknown room in WOB faculty', () => {
      const { createOSMLink } = require('../../../lib/Room/RoomOSMLinkCreator');
      const link = createOSMLink('UNKNOWN_ROOM', 'WOB');
      expect(link).toBeNull();
    });
  });
});
