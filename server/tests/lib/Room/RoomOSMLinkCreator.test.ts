// Mock OSM data
jest.mock(
  '../../../assets/overpass_osm/WF.json',
  () => ({
    'test-room': { id: 11111111, level: '1' },
  }),
  { virtual: true },
);
jest.mock(
  '../../../assets/overpass_osm/SZ.json',
  () => ({
    'test-room': { id: 22222222, level: '1' },
  }),
  { virtual: true },
);
jest.mock(
  '../../../assets/overpass_osm/SUD.json',
  () => ({
    'test-room': { id: 333333333, level: '1' },
  }),
  { virtual: true },
);
jest.mock(
  '../../../assets/overpass_osm/WOB.json',
  () => ({
    'test-room': { id: 444444444, level: '1' },
  }),
  { virtual: true },
);

describe('RoomOSMLinkCreator', () => {
  describe('WF', () => {
    it('should return correct OSM link for test-room in WF faculty', () => {
      const { createOSMLink } = require('../../../lib/Room/RoomOSMLinkCreator');
      const link = createOSMLink('test-room', 'WF');
      expect(link).toBe('https://osmapp.org/way/11111111');
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
      expect(link).toBe('https://osmapp.org/way/22222222');
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
      expect(link).toBe('https://osmapp.org/way/333333333');
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
      expect(link).toBe('https://osmapp.org/way/444444444');
    });

    it('should return null for unknown room in WOB faculty', () => {
      const { createOSMLink } = require('../../../lib/Room/RoomOSMLinkCreator');
      const link = createOSMLink('UNKNOWN_ROOM', 'WOB');
      expect(link).toBeNull();
    });
  });
});
