import * as TIMETABLES from '../assets/timetables.json';

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
    expect(TIMETABLES).toBeDefined();
  });


  it('should not include any duplicated ids', () => {
    expect(findDuplicates(TIMETABLES, 'id')).toEqual([]);
  });
});
