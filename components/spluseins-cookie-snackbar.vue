<template>
  <v-snackbar
    :value="snackbarOpen"
    :timeout="0"
    vertical
    right>
    Cookies für Einstellungen und Analytics erlauben?
    <v-layout
      justify-space-between
      fluid
      row>
      <v-btn
        ref="btn-deny"
        flat
        icon
        @click="setAllCookiesDenied()">
        Nichts
      </v-btn>
      <v-btn
        ref="btn-allow-necessary"
        flat
        icon
        @click="setNecessaryCookiesAllowed()">
        Einstellungen
      </v-btn>
      <v-btn
        ref="btn-allow-all"
        color="success"
        flat
        @click="setAllCookiesAllowed()">
        Einverstanden
      </v-btn>
    </v-layout>
  </v-snackbar>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

export default {
  name: 'SpluseinsCookieSnackbar',
  computed: {
    snackbarOpen() {
      return this.browserStateReady && this.allowAllCookies == undefined;
    },
    ...mapState({
      allowAllCookies: (state) => state.privacy.allowAllCookies,
      browserStateReady: (state) => state.browserStateReady,
    }),
  },
  watch: {
    allowAllCookies() {
      if (this.browserStateReady && this.allowAllCookies == false) {
        this.$matomo.disableCookies();
        this.$matomo.deleteCookies();
      }
    },
  },
  methods: {
    ...mapMutations({
      setNecessaryCookiesAllowed: 'privacy/setNecessaryCookiesAllowed',
      setAllCookiesAllowed: 'privacy/setAllCookiesAllowed',
      setAllCookiesDenied: 'privacy/setAllCookiesDenied',
    }),
  },
};
</script>