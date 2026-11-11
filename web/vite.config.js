import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';
import { VitePWA } from 'vite-plugin-pwa';

// Names for the Impressum. The real ones are passed as environment variable
// so they do not have to be committed to the repository.
const protectedInformation =
  'PROTECTED_INFORMATION' in process.env
    ? JSON.parse(process.env.PROTECTED_INFORMATION)
    : JSON.parse(readFileSync('./src/assets/protected-information.json'));

// During development, the API and the docs are served by other processes.
// See README.md for how to start them.
const proxy = {
  '/api': {
    target: process.env.API_URL || 'http://127.0.0.1:3001',
    changeOrigin: true,
  },
  '/docs': {
    target: process.env.DOCS_URL || 'http://127.0.0.1:8080',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/docs/, ''),
  },
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // imports only the Vuetify components which are actually used
    // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin
    vuetify(),
    // makes the app installable and usable offline
    // https://vite-pwa-org.netlify.app/guide/
    VitePWA({
      // install new versions of the app as soon as they are available
      registerType: 'autoUpdate',
      manifest: {
        name: 'SplusEins',
        short_name: 'SplusEins',
        description:
          'SplusEins - Stundenplan und Mensaplan für Studenten der Ostfalia.',
        lang: 'de',
        display: 'standalone',
        start_url: '/?standalone=true',
        theme_color: '#212121',
        background_color: '#ffffff',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        // files of the app itself: download once, then always load from cache
        globPatterns: ['**/*.{js,css,html,png,ico,woff2,otf}'],
        // big images which are rarely needed
        globIgnores: ['logo.png', 'icon.png', '404.png'],
        // all pages are rendered by index.html - except these paths
        navigateFallbackDenylist: [/^\/api\//, /^\/docs/],
        // API responses: prefer fresh data, but fall back to the last
        // response when the connection is slow or offline
        runtimeCaching: [
          {
            urlPattern: ({ url, sameOrigin }) =>
              sameOrigin &&
              url.pathname.startsWith('/api/') &&
              !url.pathname.startsWith('/api/ics/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 100, maxAgeSeconds: 14 * 24 * 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
  // constants which are replaced in the code during the build, see src/lib/config.js
  define: {
    __TEAM__: JSON.stringify(protectedInformation.team),
    __STAGING__: JSON.stringify(process.env.STAGING === 'true'),
    __VERSION__: JSON.stringify(process.env.GIT_REV || ''),
  },
  server: {
    port: 3000,
    host: process.env.DEVCONTAINER === 'true' ? '0.0.0.0' : 'localhost',
    proxy,
  },
  preview: { port: 3000, proxy },
});
