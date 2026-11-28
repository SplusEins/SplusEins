// https://vuetifyjs.com/en/getting-started/installation/
import 'vuetify/styles';
import '../assets/style/vuetify.css';
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
    VContainer: { fluid: true, maxWidth: 1200 },
    VCard: { flat: true, border: true, rounded: 'lg' },
    VCardTitle: { class: 'text-wrap font-weight-semibold pt-4' },
    VCardItem: { VCardTitle: { class: 'text-wrap font-weight-semibold' } },
    VCardActions: { class: 'px-4 pt-3 pb-4', VBtn: { slim: false } },
    VToolbarTitle: { class: 'font-weight-semibold' },
    VNavigationDrawer: { VListItemTitle: { class: 'text-wrap' } },
    VChip: { label: true },
    VDialog: { VCard: { flat: false, border: false } },
    VMenu: { VCard: { flat: false, border: false } },
    VList: { color: 'primary' },
    VTextField: { variant: 'outlined', rounded: 'lg' },
    VSelect: { variant: 'outlined', rounded: 'lg' },
  },
  display: {
    // $vuetify.display.mobile is true for windows narrower than this
    mobileBreakpoint: 960,
  },
  theme: {
    // the theme is switched in App.vue
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          background: '#F6F8FB',
          'surface-light': '#EEF2F7',
          'on-background': '#0F1B2D',
          'on-surface': '#0F1B2D',
          primary: '#1A5FC4',
          secondary: '#00234A',
          accent: '#FFC53D',
          error: '#B02E24',
          info: '#1A5FC4',
          success: '#15703A',
          warning: '#8F4E00',
        },
        variables: { 'border-color': '#0F1B2D' },
      },
      dark: {
        colors: {
          background: '#0B1424',
          surface: '#121E33',
          'surface-light': '#1A2842',
          'on-background': '#E8EEF7',
          'on-surface': '#E8EEF7',
          primary: '#8AB4F8',
          secondary: '#00234A',
          accent: '#FFC53D',
        },
      },
    },
  },
});
