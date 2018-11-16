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
      '/api/splus/SPLUS63AE59/40');
    expect(response.body).toMatchSnapshot();
  });
});
