// Production server: serves the built app from dist/ and forwards
// /api and /docs to the other services. Start with `npm start`.
import { readFileSync } from 'node:fs';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const PORT = process.env.PORT || 3000;
const app = express();

if (process.env.API_URL) {
  app.use(
    createProxyMiddleware({
      pathFilter: '/api',
      target: process.env.API_URL,
      changeOrigin: true,
    }),
  );
}
if (process.env.DOCS_URL) {
  app.use(
    createProxyMiddleware({
      pathFilter: '/docs',
      target: process.env.DOCS_URL,
      changeOrigin: true,
      pathRewrite: { '^/docs': '' },
    }),
  );
}

// Files in dist/assets have a hash in their name, so browsers may keep them forever.
app.use(
  '/assets',
  express.static('dist/assets', { immutable: true, maxAge: '1y' }),
);
// Everything else (index.html, sw.js, ...) must be checked for updates.
app.use(express.static('dist'));
// Missing files and API requests without API_URL must not be answered with the app.
app.use(['/assets', '/api', '/docs'], (req, res) => res.sendStatus(404));
// Other paths are pages of the single page app - the router in the browser handles them.
// index.html is read only once, so these requests do not need to access the disk.
const indexHtml = readFileSync('dist/index.html');
app.get('/{*path}', (req, res) => res.type('html').send(indexHtml));

app.listen(PORT, () => console.log(`listening on port ${PORT}`));
