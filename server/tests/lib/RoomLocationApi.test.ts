import { getRoomLocation } from "../../lib/RoomLocationApi";

describe('RoomLocationApi', () => {
  describe('getRoomLocation', () => {
    describe('Am Exer rooms', () => {
      it('should return full address for Am Exer campus rooms', () => {
        expect(getRoomLocation('WF-EX-2')).toBe('WF-EX-2 (Am Exer 2, 38302 Wolfenbüttel)');
        expect(getRoomLocation('WF-EX-2/')).toBe('WF-EX-2/ (Am Exer 2, 38302 Wolfenbüttel)');
        expect(getRoomLocation('WF-EX-2/252')).toBe('WF-EX-2/252 (Am Exer 2, 38302 Wolfenbüttel)');
        expect(getRoomLocation('WF-EX-3/101')).toBe('WF-EX-3/101 (Am Exer 3, 38302 Wolfenbüttel)');
        expect(getRoomLocation('WF-EX-4/303')).toBe('WF-EX-4/303 (Am Exer 4, 38302 Wolfenbüttel)');
        expect(getRoomLocation('WF-EX-5/404')).toBe('WF-EX-5/404 (Am Exer 5, 38302 Wolfenbüttel)');
        expect(getRoomLocation('WF-EX-6/505')).toBe('WF-EX-6/505 (Am Exer 6, 38302 Wolfenbüttel)');
      });

      it('should return only the room if the room does not match known patterns', () => {
        expect(getRoomLocation('UnknownRoom')).toBe('UnknownRoom');
        expect(getRoomLocation('WF-EX-XYZ')).toBe('WF-EX-XYZ');
        expect(getRoomLocation('WF-EX-/252')).toBe('WF-EX-/252');
      });
    });
  });
});