import * as express from 'express';
import splusController from './controllers/v1/splus';
import mensaController from './controllers/mensa';
import newsController from './controllers/v1/news';
import icsController from './controllers/v1/ics';
import splusController2 from './controllers/v2/splus';
import newsController2 from './controllers/v2/news';
import icsController2 from './controllers/v2/ics';

class App {
  public app: express.Application;

  constructor(private basePath: string = '/api') {
    this.app = express();
    this.routes();
  }

  private routes(): void {
    this.app.use(this.basePath + '/splus', splusController);
    this.app.use(this.basePath + '/mensa', mensaController);
    this.app.use(this.basePath + '/news', newsController);
    this.app.use(this.basePath + '/ics', icsController);
    this.app.use(this.basePath + '/v2/splus', splusController2);
    this.app.use(this.basePath + '/v2/news', newsController2);
    this.app.use(this.basePath + '/v2/ics', icsController2);
  }
}

export default App;
