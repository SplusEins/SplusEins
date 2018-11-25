import Vue from 'vue'
import VueMatomo from 'vue-matomo'

export default ({app}, inject) =>{
    Vue.use(VueMatomo, {
        host: 'https://analytics.spluseins.de',
        siteId: 1,
        router: app.$router,
        enableLinkTracking: true,
        requireConsent: false,
        trackInitialView: true,
        trackerFileName: 'piwik',
    });
};