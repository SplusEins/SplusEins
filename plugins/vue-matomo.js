import Vue from 'vue'
import VueMatomo from 'vue-matomo'

Vue.use(VueMatomo, {
  host: 'https://analytics.spluseins.de',
  siteId: 1,

  router: router,

  enableLinkTracking: true,

  requireConsent: false,

  trackInitialView: true,

  trackerFileName: 'piwik'
});