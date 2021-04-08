<template>
  <v-snackbar
    :value="snackbarOpen"
    :timeout="-1"
    vertical
    right
  >
    <span class="text-subtitle-1">
      Cookies für Einstellungen und Analytics erlauben?
    </span>
    <template #action="{ attrs }">
      <v-btn
        class="ml-2"
        ref="btn-deny"
        text
        v-bind="attrs"
        @click="setAllCookiesDenied()"
      >
        Nichts
      </v-btn>
      <v-btn
        ref="btn-allow-necessary"
        text
        v-bind="attrs"
        @click="setNecessaryCookiesAllowed()"
      >
        Einstellungen
      </v-btn>
      <v-btn
        class="mr-1"
        ref="btn-allow-all"
        color="success"
        text
        v-bind="attrs"
        @click="setAllCookiesAllowed()"
      >
        Einverstanden
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

export default {
  name: 'SpluseinsCookieSnackbar',
  computed: {
    snackbarOpen () {
      return this.browserStateReady && this.allowAllCookies == undefined;
    },
    ...mapState({
      allowAllCookies: (state) => state.privacy.allowAllCookies,
      browserStateReady: (state) => state.browserStateReady
    })
  },
  watch: {
    allowAllCookies () {
      if (this.browserStateReady && '$matomo' in this) {
        if (this.allowAllCookies == false) {
          this.$matomo.disableCookies();
          this.$matomo.deleteCookies();
          this.$matomo.setConsentGiven();
        }
        if (this.allowAllCookies == true) {
          this.$matomo.rememberConsentGiven();
        }
      }
    }
  },
  methods: {
    ...mapMutations({
      setNecessaryCookiesAllowed: 'privacy/setNecessaryCookiesAllowed',
      setAllCookiesAllowed: 'privacy/setAllCookiesAllowed',
      setAllCookiesDenied: 'privacy/setAllCookiesDenied'
    })
  }
};
</script>
