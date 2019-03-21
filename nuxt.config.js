import * as META_INFORMATION from './assets/meta-information.json';
import VuetifyLoaderPlugin from 'vuetify-loader/lib/plugin';

export default {
  mode: 'universal',

  /*
  ** Headers of the page
  */
  head: {
    titleTemplate: '%s - SplusEins',
    link: [
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700' },
    ],
    meta: [
      { hid: 'description', name: 'description', content: META_INFORMATION.description },
      { hid: 'og:description', name: 'og:description', content: META_INFORMATION.description },
      { hid: 'keywords', name: 'keywords', content: META_INFORMATION.keywords },
    ],
  },

  /*
  ** Meta of the page
  */
  meta: {
    nativeUI: true,
    lang: 'de',
    name: 'SplusEins',
    author: 'SplusEins-Team',
    ogHost: 'https://spluseins.de',
    ogImage: '/logo.png',
  },

  /*
  ** Customize the progress-bar color
  */
  loading: {
    color: '#ffc107', // amber.base
  },

  /*
  ** Global CSS
  */
  css: [
    '~/assets/style/app.scss',
    'vuetify/dist/vuetify.min.css',
    'dayspan-vuetify/dist/lib/dayspan-vuetify.min.css',
    '@mdi/font/css/materialdesignicons.min.css'
  ],

  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    // https://vuetifyjs.com
    '@/plugins/vuetify',
    // https://github.com/championswimmer/vuex-persist
    { src: '@/plugins/vuex-persist', mode: 'client' },
    // https://github.com/AmazingDreams/vue-matomo
    { src: '@/plugins/vue-matomo', mode: 'client' },
    // https://github.com/Inndy/vue-clipboard2
    '@/plugins/vue-clipboard2',
    // https://github.com/dumptyd/vue-css-donut-chart
    '@/plugins/vue-css-donut-chart',
    '@/plugins/lazy-hydrate',
  ],

  /*
  ** Nuxt.js modules
  */
  modules: [
    // https://github.com/nuxt-community/axios-module#usage
    '@nuxtjs/axios',
    // https://pwa.nuxtjs.org/
    '@nuxtjs/pwa',
  ],
  /*
  ** Axios module configuration
  */
  axios: {
  },

  /*
  ** Build configuration
  */
  build: {
    extend(config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        });
      }
    },
    plugins: [new VuetifyLoaderPlugin()],
    extractCSS: true,
    transpile: ['vuetify/lib'],
  },

  /*
  ** Generate configuration
  */
  generate: {
    fallback: true,
    routes: [],
  },
};
