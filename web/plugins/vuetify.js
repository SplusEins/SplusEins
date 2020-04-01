import Vue from 'vue';
import Vuetify, { VMenu } from 'vuetify/lib';
import colors from 'vuetify/es5/util/colors';

import moment from 'moment';
import { default as options } from './dayspan.config.js'
import DaySpanVuetify from 'dayspan-vuetify';
import { default as LocaleDe } from '~/assets/ds-de.js';

moment.locale('de');

Vue.use(DaySpanVuetify, options);

Vue.$dayspan.addLocale('de', LocaleDe);
Vue.$dayspan.setLocale('de', true);

Vue.use(Vuetify, {
  components: { VMenu },
  iconfont: 'mdi',
  options: {
    customProperties: true,
  },
  theme: {
    primary: colors.blue.darken3,
    accent: colors.lightBlue.base,
    secondary: colors.lightBlue.base,
    info: colors.teal.lighten1,
    warning: colors.blue.darken3,
    error: colors.deepOrange.accent4,
    success: colors.green.accent3,
  },
});
