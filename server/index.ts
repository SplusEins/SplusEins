import app from './app';

const host = process.env.HOST || '127.0.0.1';
const port = parseInt(process.env.PORT) || 3000;
app.listen(port, host, () => {
  console.log(`listening on host ${host} and port ${port}`)
});
