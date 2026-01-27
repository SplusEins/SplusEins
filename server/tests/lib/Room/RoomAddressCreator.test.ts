import { createRoomAddress } from '../../../lib/Room/RoomAddressCreator';

describe('RoomAddressCreator', () => {
  describe('WF', () => {
    it('should return correct location for WF-EX-2/252 in WF faculty', () => {
      const location = createRoomAddress('WF-EX-2/252', 'WF');
      expect(location).toBe('Am Exer 2, 38302 Wolfenbüttel');
    });

    it('should return correct location for A068 in WF faculty', () => {
      const location = createRoomAddress('A068', 'WF');
      expect(location).toBe('Salzdahlumer Str. 46/48, 38302 Wolfenbüttel');
    });

    it('should return null for unknown room in WF faculty', () => {
      const location = createRoomAddress('UNKNOWN_ROOM', 'WF');
      expect(location).toBeNull();
    });
  });
});
