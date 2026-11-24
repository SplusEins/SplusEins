import { describe, it, expect, vi } from 'vitest';
import {
  FacultyLocation,
  getLectureRoomLocations,
  getRoomLocation,
  roomsToText,
} from '../../../lib/Room/RoomLocationApi';

// Mock location of faculty data
vi.mock('../../../assets/locationOfFaculty.json', () => ({
  default: {
    'Fakultät in Wolfenbüttel': 'WF',
    'Fakultät in Wolfsburg': 'WOB',
    'Fakultät in Salzgitter': 'SZ',
    'Fakultät in Suderburg': 'SUD',
  },
}));

// Mock OSM link creator
vi.mock('../../../lib/Room/RoomOSMLinkCreator', () => ({
  createOSMLink: vi.fn((room: string, facultyLocation: FacultyLocation) => {
    if (room === 'WF-EX-2/252' && facultyLocation === 'WF') {
      return 'https://osmapp.org/way/123456789';
    }
    if (room === 'WF-EX-3/101' && facultyLocation === 'WF') {
      return 'https://osmapp.org/way/987654321';
    }
    if (room === 'A068' && facultyLocation === 'WF') {
      return 'https://osmapp.org/way/123456789';
    }
    return null;
  }),
}));

// Mock Room address creator
vi.mock('../../../lib/Room/RoomAddressCreator', () => ({
  createRoomAddress: vi.fn((room: string, facultyLocation: FacultyLocation) => {
    if (room === 'WF-EX-2/252' && facultyLocation === 'WF') {
      return 'Am Exer 2, 38302 Wolfenbüttel';
    }
    if (room === 'WF-EX-3/101' && facultyLocation === 'WF') {
      return 'Am Exer 3, 38302 Wolfenbüttel';
    }
    if (room === 'A068' && facultyLocation === 'WF') {
      return 'Salzdahlumer Str. 46/48, 38302 Wolfenbüttel';
    }
    return null;
  }),
}));

describe('RoomLocationApi', () => {
  describe('getRoomLocation', () => {
    it('should return correct location info for WF-EX-2/252 in WF faculty', () => {
      const locationInfo = getRoomLocation(
        'WF-EX-2/252',
        'Fakultät in Wolfenbüttel',
      );
      expect(locationInfo).toEqual({
        name: 'WF-EX-2/252',
        address: 'Am Exer 2, 38302 Wolfenbüttel',
        url: 'https://osmapp.org/way/123456789',
      });
    });

    it('should return correct location info for WF-EX-3/101 in WF faculty', () => {
      const locationInfo = getRoomLocation(
        'WF-EX-3/101',
        'Fakultät in Wolfenbüttel',
      );
      expect(locationInfo).toEqual({
        name: 'WF-EX-3/101',
        address: 'Am Exer 3, 38302 Wolfenbüttel',
        url: 'https://osmapp.org/way/987654321',
      });
    });

    it('should return correct location info for A068 in WF faculty', () => {
      const locationInfo = getRoomLocation('A068', 'Fakultät in Wolfenbüttel');
      expect(locationInfo).toEqual({
        name: 'A068',
        address: 'Salzdahlumer Str. 46/48, 38302 Wolfenbüttel',
        url: 'https://osmapp.org/way/123456789',
      });
    });

    it('should return room name only for unknown room in WF faculty', () => {
      const locationInfo = getRoomLocation(
        'UNKNOWN_ROOM',
        'Fakultät in Wolfenbüttel',
      );
      expect(locationInfo).toEqual({ name: 'UNKNOWN_ROOM' });
    });
  });

  it('should split the rooms of a lecture', () => {
    expect(
      getLectureRoomLocations('A068, Online,', 'Fakultät in Wolfenbüttel'),
    ).toEqual([
      {
        name: 'A068',
        address: 'Salzdahlumer Str. 46/48, 38302 Wolfenbüttel',
        url: 'https://osmapp.org/way/123456789',
      },
      { name: 'Online' },
    ]);
  });

  it('should write the rooms as text with their address', () => {
    expect(
      roomsToText([
        {
          name: 'A068',
          address: 'Salzdahlumer Str. 46/48, 38302 Wolfenbüttel',
        },
        { name: 'B107' },
      ]),
    ).toBe('A068, Salzdahlumer Str. 46/48, 38302 Wolfenbüttel / B107');
  });
});
