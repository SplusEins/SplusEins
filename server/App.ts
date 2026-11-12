import express, { ErrorRequestHandler } from 'express';
import cors from 'cors';
import splusController from './controllers/splus';
import mensaController from './controllers/mensa';
import newsController from './controllers/news';
import icsController from './controllers/ics';
import busController from './controllers/bus';

class App {
  public app: express.Application;

  constructor(private basePath: string = '/api') {
    this.app = express();
    this.app.use(cors());
    this.routes();
  }

  private routes(): void {
    this.app.use(this.basePath + '/splus', splusController);
    this.app.use(this.basePath + '/mensa', mensaController);
    this.app.use(this.basePath + '/news', newsController);
    this.app.use(this.basePath + '/ics', icsController);
    this.app.use(this.basePath + '/bus', busController);

    // express default route handler => 404
    this.app.use(function (req, res) {
      return res.status(404).type('txt').send('Invalid API called');
    });
    // Any unhandled server error => 500
    // the details are only logged, they may contain internal information
    const handleError: ErrorRequestHandler = (err, _req, res, next) => {
      if (res.headersSent) return next(err); // already handled
      console.error(err.stack);
      res
        .status(500)
        .type('txt')
        .send('A server error occured. Please inform team@spluseins.de.');
    };
    this.app.use(handleError);
  }
}

export default App;
