import VuetifyLoaderPlugin from 'vuetify-loader/lib/plugin';
import webpack from 'webpack';

export default {
  mode: 'universal',

  /*
  ** Headers of the page
  */
  head: {
    titleTemplate: '%s - SplusEins',
    meta: [
      {
        hid: 'description',
        name: 'description',
        template: (title) => `${title} – Stundenplan und Mensaplan für Studenten der Ostfalia Wolfenbüttel. Schaue Pläne von splus Ostfalia und Mensa Ostfalia an.`,
      },
      {
        hid: 'og:description',
        property: 'og:description',
        template: (title) => `${title} – Stundenplan und Mensaplan für Studenten der Ostfalia Wolfenbüttel. Schaue Pläne von splus Ostfalia und Mensa Ostfalia an.`,
      },
      { hid: 'keywords', name: 'keywords', content: 'Splus1, splus1, Sommersemester 2020, SS20, Ostfalia, Stundenplan, Mensaplan, Mensa, Semesterplan, Plan, Wolfenbüttel, Informatik, Maschinenbau, Soziale Arbeit, Elektrotechnik, Recht, Versorgungstechnik, Wahlfächer, Wahlpflichtfächer' },
      { hid: 'google-site-verification', name: 'google-site-verification', content: 'EBsrsgaLbFe2iWIzVaE77k6bO0BtpcgBVLXm5DJzgUc' }
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
    '~/assets/style/roboto.css',
    'vuetify/src/stylus/app.styl',
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
    // https://github.com/maoberlehner/vue-lazy-hydration
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
    plugins: [
      new VuetifyLoaderPlugin(),
      new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /de/),
    ],
    extractCSS: true,
    transpile: [/^vuetify/],
  },

  /*
  ** Generate configuration
  */
  generate: {
    fallback: true,
    routes: [],
  },
};
