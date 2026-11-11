import App from './App';
import { removeExpiredCacheEntries } from './lib/cache';

const host = process.env.HOST || '127.0.0.1';
const port = parseInt(process.env.PORT) || 3001;
const path = process.env.API_PREFIX;

removeExpiredCacheEntries();

new App(path).app.listen(port, host, () => {
  console.log(`listening on host ${host} and port ${port}`);
});
