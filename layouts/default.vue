<template>
  <v-app :dark="isDark">
    <spluseins-header/>
    <v-content fill-height>

      <nuxt />
  
      <spluseins-error-snackbar />
      <no-ssr>
        <!-- no ssr: show/hide depends on client's local storage settings -->
        <spluseins-cookie-snackbar />
        <!-- no ssr: needs a client only event -->
        <spluseins-pwa-snackbar />
      </no-ssr>
    </v-content>
    <spluseins-footer/>
  </v-app>
</template>

<script>
import { mapState } from 'vuex';

import SpluseinsHeader from '../components/spluseins-header.vue';
import SpluseinsFooter from '../components/spluseins-footer.vue';
import SpluseinsPwaSnackbar from '../components/spluseins-pwa-snackbar.vue';
import SpluseinsErrorSnackbar from '../components/spluseins-error-snackbar.vue';
import SpluseinsCookieSnackbar from '../components/spluseins-cookie-snackbar.vue';

export default {
  components: {
    SpluseinsHeader,
    SpluseinsFooter,
    SpluseinsPwaSnackbar,
    SpluseinsErrorSnackbar,
    SpluseinsCookieSnackbar,
  },
  computed: {
    ...mapState({
      isDark: state => state.theme.isDark,
    }),
  },
};
</script>