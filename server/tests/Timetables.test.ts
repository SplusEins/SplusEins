import * as TIMETABLES_WS from '../../assets/timetables.ws.json';
import * as TIMETABLES_SS from '../../assets/timetables.ss.json';

describe('Test Timetables JSON', () => {

  const findDuplicates = (list, key) => {
    const res = new Map()
    list.forEach(el => {
      res.set(el[key], el);
    });
    Array.from(res).forEach(el0 => {
      const index = list.findIndex(el1 => el0[0] === el1[key]);
      if (index != -1) list.splice(index, 1);
    });
    return list;
  };

  it('should be defined', async () => {
    expect(TIMETABLES_WS).toBeDefined();
    expect(TIMETABLES_SS).toBeDefined();
  });


  it('should check if splus have the right length', () => {
    TIMETABLES_WS.forEach(el => {
      if(el.id.length != 11) console.log(el.id);
      expect(el.id.length).toEqual(11);
    });
    TIMETABLES_SS.forEach(el => {
      if(el.id.length != 11) console.log(el.id);
      expect(el.id.length).toEqual(11);
    });
  });

  it('should check if splus ids are in right format', () => {
    const splusIDRegex = /SPLUS[A-Za-z0-9]{6}/g;
    TIMETABLES_WS.forEach(el => expect(el.id.match(splusIDRegex)).not.toEqual(null));
    TIMETABLES_SS.forEach(el => expect(el.id.match(splusIDRegex)).not.toEqual(null));
  });

  it('should not include any duplicated splus ids', () => {
    expect(findDuplicates(TIMETABLES_WS, 'id')).toEqual([]);
    expect(findDuplicates(TIMETABLES_SS, 'id')).toEqual([]);
  });
});
