import Vue from 'vue';
import Vuetify from 'vuetify';
import moment from 'moment';
import {default as options} from './dayspan.config.js'
import DaySpanVuetify from 'dayspan-vuetify';
import colors from 'vuetify/es5/util/colors';
import { default as LocaleDe } from '~/assets/ds-de.js';

moment.locale('de');

Vue.use(DaySpanVuetify, options);

Vue.$dayspan.addLocale('de', LocaleDe);
Vue.$dayspan.setLocale('de', true);

Vue.use(Vuetify, {
  iconfont: 'mdi',
  options: {
    customProperties: true,
  },
  theme: {
    primary: colors.amber.base,
    accent: colors.lightBlue.base,
    secondary: colors.lightBlue.base,
    info: colors.teal.lighten1,
    warning: colors.amber.base,
    error: colors.deepOrange.accent4,
    success: colors.green.accent3,
  },
});
