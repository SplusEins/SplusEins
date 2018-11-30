import * as express from 'express';
import splusController from './controllers/splus';
import mensaController from './controllers/mensa';

class App {
  public app: express.Application;

  constructor(private basePath: string = '/api') {
    this.app = express();
    this.routes();
  }

  private routes(): void {
    this.app.use(this.basePath + '/splus', splusController);
    this.app.use(this.basePath + '/mensa', mensaController);
  }
}

export default App;
