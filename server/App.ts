import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import splusController from './controllers/splus';
import mensaController from './controllers/mensa';
import newsController from './controllers/news';
import icsController from './controllers/ics';
import busController from './controllers/bus';

const COOKIE_SECRET = process.env.COOKIE_SECRET;

class App {
  public app: express.Application;

  constructor (private basePath: string = '/api') {
    this.app = express();
    this.app.use(cookieParser(COOKIE_SECRET));
    this.app.use(cors())
    this.routes();
  }

  private routes (): void {
    this.app.use(this.basePath + '/splus', splusController);
    this.app.use(this.basePath + '/mensa', mensaController);
    this.app.use(this.basePath + '/news', newsController);
    this.app.use(this.basePath + '/ics', icsController);
    this.app.use(this.basePath + '/bus', busController);
  }
}

export default App;
