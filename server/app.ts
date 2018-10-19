import * as express from 'express';
import splusController from './controllers/splus';

class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.routes();
  }

  private routes(): void {
    this.app.use('/api/splus', splusController);
  }
}

export default new App().app;
