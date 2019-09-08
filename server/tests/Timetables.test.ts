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

  it('should not include any duplicated splus ids', () => {
    expect(findDuplicates(TIMETABLES_WS, 'id')).toEqual([]);
    expect(findDuplicates(TIMETABLES_SS, 'id')).toEqual([]);
  });

  it('should not include any duplicated slugs', () => {
    expect(findDuplicates(TIMETABLES_WS, 'slug')).toEqual([]);
    expect(findDuplicates(TIMETABLES_SS, 'slug')).toEqual([]);
  });

});