process.env.CACHE_DISABLE = '1';

import App from './App';
import * as request from 'supertest';

import { SplusApi } from './lib/SplusApi';
import { SplusParser } from './lib/SplusParser';
import { ILecture } from './lib/ILecture';
import { readFile } from 'fs';
import { promisify } from 'util';

describe('Test backend', () => {
  const app = new App().app;

  async function splusMock(identifier: string,
                           weekOfYear: string): Promise<ILecture[]> {
    const htmlPath = './server/__snapshots__/splus_ibi1_44.html';
    const html = await promisify(readFile)(htmlPath, 'utf8');
    return new SplusParser(html).getLectures();
  }

  it('should return parsed lectures', async () => {
    SplusApi.getData = jest.fn().mockImplementationOnce(splusMock);
    const response = await request(app).get(
      '/api/splus/SPLUS7A3292/10');
    expect(response.body).toMatchSnapshot();
  });

  it('should create an ICS for multiple parameters', async () => {
    SplusApi.getData = jest.fn().mockImplementation(splusMock);
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

  it('should create an ICS for one parameter', async () => {
    SplusApi.getData = jest.fn().mockImplementation(splusMock);
    const response = await request(app).get(
      '/api/ics/v1/SPLUS7A3292/GdPL');
    expect(response.statusCode).toBe(200);
    expect(response.header['content-type']).toBe('text/plain; charset=utf-8');
    expect(response.text).toContain('BEGIN:VCALENDAR');
    expect(response.text).toContain('BEGIN:VEVENT');
    expect(response.text).toContain('Grundlagen des Programmierens - Labor');
    expect(response.text).not.toContain('Technische Grundlagen der Informatik');
  })
});
