import PROTECTED_INFORMATION from './assets/protected-information.json';
import de from 'vuetify/lib/locale/de'

export default {
  telemetry: false,
  modern: process.env.NODE_ENV == 'development' ? false : 'server',

  /*
  ** Headers of the page
  */
  head: {
    titleTemplate: '%s - SplusEins',
    meta: [
      { hid: 'keywords', name: 'keywords', content: 'SplusEins, Splus1, splus1, Sommersemester 2020, SS20, Ostfalia, Stundenplan, Busplan, Bus, Mensaplan, Mensa, Semesterplan, Plan, Wolfenbüttel, Suderburg, Wolfsburg, Salzgitter, Informatik, Bau, Wasser, Boden, Fahrzeugtechnik, Gesundheitswesen, Verkehr, Sport, Tourismus, Medien, Soziale Arbeit, Elektrotechnik, Recht, Versorgungstechnik, Wahlfächer, Wahlpflichtfächer' },
      { hid: 'google-site-verification', name: 'google-site-verification', content: 'EBsrsgaLbFe2iWIzVaE77k6bO0BtpcgBVLXm5DJzgUc' }
    ]
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
    ogImage: '/logo.png'
  },

  /*
  ** Customize the progress-bar color
  */
  loading: {
    color: '#1565C0' // blue.darken3
  },

  /*
  ** Global CSS
  */
  css: [
    '~/assets/style/roboto.css'
  ],

  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    // https://github.com/championswimmer/vuex-persist
    { src: '@/plugins/vuex-persist', mode: 'client' },
    // https://github.com/AmazingDreams/vue-matomo
    { src: '@/plugins/vue-matomo', mode: 'client' },
    // https://github.com/Inndy/vue-clipboard2
    '@/plugins/vue-clipboard2',
    // https://github.com/dumptyd/vue-css-donut-chart
    '@/plugins/vue-css-donut-chart'
  ],

  /*
  ** Nuxt.js modules
  */
  modules: [
    // https://github.com/nuxt-community/axios-module#usage
    '@nuxtjs/axios',
    // https://pwa.nuxtjs.org/
    '@nuxtjs/pwa',
    // https://github.com/nuxt-community/dayjs-module
    '@nuxtjs/dayjs'
  ],
  /*
  ** Axios module configuration
  */
  axios: {

  },
  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    '@nuxtjs/eslint-module',
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify'
  ],

  env: {
    team: ('PROTECTED_INFORMATION' in process.env ? JSON.parse(process.env.PROTECTED_INFORMATION) : PROTECTED_INFORMATION).team
  },

  /*
  ** Build configuration
  */
  build: {
    standalone: true, // has some advantages, see https://github.com/nuxt/nuxt.js/pull/4661
    extend (config, ctx) {
      if (ctx.isDev) {
        config.devtool = ctx.isClient ? 'source-map' : 'inline-source-map'
      }
    },
    extractCSS: true
  },

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    // customVariables: ['~/assets/variables.scss'],
    // treeshake: true,
    breakpoint: {
      mobileBreakpoint: 'sm' // This is equivalent to a value of 960
    },
    icons: {
      iconfont: 'mdiSvg'
    },
    defaultAssets: false,
    theme: {
      options: { customProperties: true }
    },
    lang: {
      locales: { de },
      current: 'de'
    }
  },

  // Moment js replacement https://github.com/nuxt-community/dayjs-module#usage
  dayjs: {
    locales: ['de'],
    defaultLocale: 'de',
    plugins: [
      'isoWeek',
      'weekOfYear',
      'relativeTime'
    ]
  },

  /*
  ** Generate configuration
  */
  generate: {
    fallback: true,
    routes: []
  }
};
