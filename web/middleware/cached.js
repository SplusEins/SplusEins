const PAGE_CACHE_SECONDS = process.env.PAGE_CACHE_SECONDS || '600';

export default function ({ res, req, store }) {
  if (
    req &&
    req.headers &&
    req.headers.cookie &&
    req.headers.cookie.includes('dark=true')
  ) {
    store.state.ui.isDark = true;
  }
  if (res != undefined && store.state.errorQueue.length == 0) {
    res.setHeader('Cache-Control', `public, max-age=${PAGE_CACHE_SECONDS}`);
    res.setHeader('Vary', 'Cookie');
  }
}
