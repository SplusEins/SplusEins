import App from './App';
import { config } from './config';
import { startCacheCleanup } from './lib/cache';

startCacheCleanup();

new App(config.apiPrefix).app.listen(config.port, config.host, () => {
  console.log(`listening on host ${config.host} and port ${config.port}`);
});
