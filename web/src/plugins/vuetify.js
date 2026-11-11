// https://vuetifyjs.com/en/getting-started/installation/
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg';
import { de } from 'vuetify/locale';

export default createVuetify({
  // icons are imported one by one from @mdi/js, so only the used ones are downloaded
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  locale: {
    locale: 'de',
    messages: { de },
  },
  // default props of components
  defaults: {
    VTextField: { variant: 'underlined' },
    VSelect: { variant: 'underlined' },
  },
  display: {
    // $vuetify.display.mobile is true for windows narrower than this
    mobileBreakpoint: 960,
  },
  theme: {
    // the theme is switched in App.vue
    defaultTheme: 'light',
    themes: {
      light: { colors: { primary: '#1976D2', secondary: '#424242' } },
      dark: { colors: { primary: '#2196F3', secondary: '#424242' } },
    },
  },
});
