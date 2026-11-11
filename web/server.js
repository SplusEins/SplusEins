// Production server: serves the built app from dist/ and forwards
// /api and /docs to the other services. Start with `npm start`.
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
// Unknown paths are pages of the single page app - the router in the browser handles them.
app.use((req, res) => res.sendFile('index.html', { root: 'dist' }));

app.listen(PORT, () => console.log(`listening on port ${PORT}`));
