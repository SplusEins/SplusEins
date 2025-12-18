import { getRoomLocation } from '../../lib/RoomLocationApi';

// Mock OSM data
jest.mock(
  '../../assets/overpassOSMRoomsData.json',
  () => ({
    'WF-EX-2/252': { id: 123456789, level: '2' },
    'WF-EX-3/101': { id: 987654321, level: '1' },
    A068: { id: 123456789, level: '0' },
  }),
  { virtual: true },
);

describe('RoomLocationApi', () => {
  describe('getRoomLocation', () => {
    describe('Am Exer rooms', () => {
      it('should return full address for Am Exer 2/252 room with OSM link', () => {
        const room = 'WF-EX-2/252';
        const expected =
          'WF-EX-2/252 (Am Exer 2, 38302 Wolfenbüttel) Link: https://osmapp.org/way/123456789';
        expect(getRoomLocation(room)).toBe(expected);
      });

      it('should return full address for Am Exer 3/101 room with OSM link', () => {
        const room = 'WF-EX-3/101';
        const expected =
          'WF-EX-3/101 (Am Exer 3, 38302 Wolfenbüttel) Link: https://osmapp.org/way/987654321';
        expect(getRoomLocation(room)).toBe(expected);
      });

      it('should return full address without link for Am Exer rooms without a OSM entry', () => {
        const room = 'WF-EX-4/303';
        const expected = 'WF-EX-4/303 (Am Exer 4, 38302 Wolfenbüttel)';
        expect(getRoomLocation(room)).toBe(expected);
      });
    });

    // describe('Main building rooms', () => {
    //   it('should return full address for A068 room with OSM link', () => {
    //     const room = 'A068';
    //     const expected = 'A068 (Salzdahlumer Str. 46/48, 38302 Wolfenbüttel) Link: https://osmapp.org/way/123456789';
    //     expect(getRoomLocation(room)).toBe(expected);
    //   });

    //   it('should return full address without link for A067 rooms without a OSM entry', () => {
    //     const room = 'A067';
    //     const expected = 'A067 (Salzdahlumer Str. 46/48, 38302 Wolfenbüttel)';
    //     expect(getRoomLocation(room)).toBe(expected);
    //   });
    // });

    it("should return room as it is for rooms, that can't exist", () => {
      const room = 'non-existing-room';
      const expected = 'non-existing-room';
      expect(getRoomLocation(room)).toBe(expected);
    });
  });
});
