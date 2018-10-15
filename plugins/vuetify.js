import Vue from 'vue';
import Vuetify from 'vuetify';
import moment from 'moment';
import DaySpanVuetify from 'dayspan-vuetify';
import colors from 'vuetify/es5/util/colors';

moment.locale('de');

Vue.use(DaySpanVuetify, {
  methods: {
    getDefaultEventColor: () => '#1976d2',
  },
});

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
