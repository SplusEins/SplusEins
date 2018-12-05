const schedules = require('./assets/schedules.json');

export default {
  mode: 'universal',

  /*
  ** Headers of the page
  */
  head: {
    titleTemplate: '%s - SplusEins',
    link: [		
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700ç' },
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
    description: 'Stundenplan Plus Mehr für Studenten der Ostfalia.',
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
    '~/assets/style/app.scss'
  ],

  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    // https://vuetifyjs.com
    '@/plugins/vuetify',
    // https://github.com/championswimmer/vuex-persist
    { src: '@/plugins/vuex-persist', ssr: false },
    // https://github.com/AmazingDreams/vue-matomo
    { src: '@/plugins/vue-matomo', ssr: false },
    // https://github.com/Inndy/vue-clipboard2
    '@/plugins/vue-clipboard2',
  ],

  /*
  ** Nuxt.js modules
  */
  modules: [
    // https://github.com/nuxt-community/axios-module#usage
    '@nuxtjs/axios',
    // https://pwa.nuxtjs.org/
    '@nuxtjs/pwa',
    'nuxt-material-design-icons',
    // https://github.com/nuxt-community/typescript-template
    '~/modules/typescript',
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
    parallel: true,
    cache: true,
    /*
    ** You can extend webpack config here
    */
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
    }
  },

  /*
  ** Generate configuration
  */
  generate: {
    fallback: true,
    routes: schedules.map(({ id }) => `/plan/${id}`),
  },
};