import App from './App';

const host = process.env.HOST || '127.0.0.1';
const port = parseInt(process.env.PORT) || 3000;
const path = process.env.API_PREFIX;

new App(path).app.listen(port, host, () => {
  console.log(`listening on host ${host} and port ${port}`)
});
