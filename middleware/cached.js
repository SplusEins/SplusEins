const PAGE_CACHE_SECONDS = process.env.PAGE_CACHE_SECONDS || '3600';

export default function ({ res }) {
  if (process.server) {
    res.setHeader('Cache-Control', `public, max-age=${PAGE_CACHE_SECONDS}`);
  }
}
