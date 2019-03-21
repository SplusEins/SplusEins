const PAGE_CACHE_SECONDS = process.env.PAGE_CACHE_SECONDS || '600';

export default function ({ res, store }) {
  if (process.server && store.state.errorQueue.length == 0) {
    res.setHeader('Cache-Control', `public, max-age=${PAGE_CACHE_SECONDS}`);
  }
}
