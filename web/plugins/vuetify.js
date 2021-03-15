import Vue from 'vue';
import Vuetify, { VMenu } from 'vuetify/lib';
import colors from 'vuetify/es5/util/colors';

import moment from 'moment';

moment.locale('de');

Vue.use(Vuetify, {
  components: { VMenu },
  options: {
    customProperties: true
  },
  theme: {
    primary: colors.blue.darken3,
    accent: colors.lightBlue.base,
    secondary: colors.amber.base, // '#009eeD', // wolfenbüttel-blau, da sonst keine sekundär farbe gegeben ist
    info: colors.teal.lighten1,
    warning: colors.blue.darken3,
    error: colors.deepOrange.accent4,
    success: colors.green.accent3
  }
});
