process.env.CACHE_DISABLE = '1';

import App from './App';
import * as request from 'supertest';

import { SplusParser } from './lib/v1/SplusParser';
import { readFile } from 'fs';
import { promisify } from 'util';
import { RichLecture } from './model/v1/RichLecture';

async function splusApiMock(identifier: string, weekOfYear: string) {
  const htmlPath = './server/__snapshots__/splus_ibi1_44.html';
  const html = await promisify(readFile)(htmlPath, 'utf8');
  const lectures = new SplusParser(html).getLectures();
  return lectures.map((lecture) => new RichLecture(lecture, 12));
}

jest.mock('./lib/SplusApi', () => ({
  default: jest.fn().mockImplementation(splusApiMock),
  getLecturesForTimetablesAndWeeks: jest.fn().mockImplementation(splusApiMock),
}));

describe('Test backend', () => {
  const app = new App().app;

  it('should return parsed lectures', async () => {
    const response = await request(app).get(
      '/api/splus/SPLUS7A3292/10');
    expect(response.body).toMatchSnapshot();
  });

  it('should create a ICS for multiple timetables and filters', async () => {
    const response = await request(app).get(
      '/api/ics/v1/SPLUS7A3292,SPLUS7A3293/GdPL,DSB');
    expect(response.statusCode).toBe(200);
    expect(response.header['content-type']).toBe('text/plain; charset=utf-8');
    expect(response.text).toContain('BEGIN:VCALENDAR');
    expect(response.text).toContain('BEGIN:VEVENT');
    expect(response.text).toContain('Diskrete Strukturen');
    expect(response.text).toContain('Grundlagen des Programmierens - Labor');
    expect(response.text).not.toContain('Technische Grundlagen der Informatik');
  });

  it('should create an ICS for one timetable and one filter', async () => {
    const response = await request(app).get(
      '/api/ics/v1/SPLUS7A3292/GdPL');
    expect(response.statusCode).toBe(200);
    expect(response.header['content-type']).toBe('text/plain; charset=utf-8');
    expect(response.text).toContain('BEGIN:VCALENDAR');
    expect(response.text).toContain('BEGIN:VEVENT');
    expect(response.text).toContain('Grundlagen des Programmierens - Labor');
    expect(response.text).not.toContain('Technische Grundlagen der Informatik');
  });

  it('should create an ICS for one timetable and no filter', async () => {
    const response = await request(app).get(
      '/api/ics/v1/SPLUS7A3292');
    expect(response.statusCode).toBe(200);
    expect(response.header['content-type']).toBe('text/plain; charset=utf-8');
    expect(response.text).toContain('BEGIN:VCALENDAR');
    expect(response.text).toContain('BEGIN:VEVENT');
    expect(response.text).toContain('Grundlagen des Programmierens - Labor');
    expect(response.text).toContain('Technische Grundlagen der Informatik');
  });

  it('should not find an ICS for a timetable that does not exist', async () => {
    const response = await request(app).get(
      '/api/ics/v1/DOESNOTEXIST');
    expect(response.statusCode).toBe(404);
  });

  it('should return an ICS matching the snapshot', async () => {
    const response = await request(app).get(
      '/api/ics/v1/SPLUS7A3292,SPLUS7A3293/GdPL,DSB');
    const deterministicText = response.text.replace(/^DTSTAMP:.*$/gm, '');
    expect(deterministicText).toMatchSnapshot();
  });
});
