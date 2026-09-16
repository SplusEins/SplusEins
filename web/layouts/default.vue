<template>
  <v-app :dark="isDark">
    <spluseins-header />
    <v-main fill-height>
      <nuxt />

      <spluseins-error-snackbar />
    </v-main>
    <spluseins-footer />
    <spluseins-disclaimer />
  </v-app>
</template>

<script>
import { mapState } from 'vuex';

import SpluseinsHeader from '../components/spluseins-header.vue';
import SpluseinsFooter from '../components/spluseins-footer.vue';
import SpluseinsErrorSnackbar from '../components/spluseins-error-snackbar.vue';
import SpluseinsDisclaimer from '../components/spluseins-disclaimer.vue';

export default {
  components: {
    SpluseinsHeader,
    SpluseinsFooter,
    SpluseinsErrorSnackbar,
    SpluseinsDisclaimer,
  },
  computed: {
    ...mapState({
      isDark: (state) => state.ui.isDark,
    }),
  },
  mounted() {
    this.$vuetify.theme.dark = this.isDark;
  },
};
</script>
