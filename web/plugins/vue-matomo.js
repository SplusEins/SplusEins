import Vue from 'vue';
import VueMatomo from 'vue-matomo';

export default ({ app }, inject) =>{
  Vue.use(VueMatomo, {
    host: 'https://analytics.spluseins.de',
    siteId: 1,
    router: app.router,
    enableLinkTracking: true,
    requireConsent: true,
    trackInitialView: true,
    trackerFileName: 'piwik',
  });
  inject('track', function (category, action, name, value) {
    if ('$matomo' in this) {
      this.$matomo.trackEvent(category, action, name, value);
    }
  });
};
