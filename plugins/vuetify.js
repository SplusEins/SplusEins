import Vue from 'vue';
import Vuetify from 'vuetify';
import moment from 'moment';
import DaySpanVuetify from './dayspan-vuetify/src/lib';
import colors from 'vuetify/es5/util/colors';
import { default as LocaleDe } from '~/assets/ds-de.js';

moment.locale('de');

Vue.use(DaySpanVuetify, {
  methods: {
    getDefaultEventColor: () => '#1976d2',
  },
});

Vue.$dayspan.addLocale('de', LocaleDe);
Vue.$dayspan.setLocale('de', true);

Vue.use(Vuetify, {
  theme: {
    primary: '#121212', // a color that is not in the material colors palette
    accent: colors.grey.darken3,
    secondary: colors.amber.darken3,
    info: colors.teal.lighten1,
    warning: colors.amber.base,
    error: colors.deepOrange.accent4,
    success: colors.green.accent3,
  },
});
