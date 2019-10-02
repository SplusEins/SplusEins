<template>
  <v-snackbar
    :value="snackbarOpen"
    :timeout="0"
    :auto-height="true"
    :auto-width="true"
    vertical
    right
  >
    <v-subheader dark>
      Diese Webseite benutzt Cookies für Einstellungen und Analytics.
    </v-subheader>
    Wir benutzen Cookies um die Stundenpläne zu speichern und um die Benutzung der Webseite zu verfolgen. Nur dadurch können wir ein einwandfreies Benutzungserlebnis garantieren.
    <v-layout
      fluid
      row
    > 
      <v-flex 
        md10 
        justify-space-around
      >
        <v-radio-group 
          v-model="cookieDecision" 
          row 
          mandatory
        >
          <v-radio 
            dark 
            color="primary" 
            label="Keine" 
            value="nothing" 
          />
          <v-radio 
            dark 
            color="primary" 
            label="Einstellungen" 
            value="settings" 
          />
          <v-radio
            dark 
            color="primary" 
            label="Analytics" 
            value="analytics" 
          />
        </v-radio-group>
      </v-flex>
      <v-flex 
        md4
        justify-end
      >
        <v-btn
          ref="btn-set-cookies"
          flat
          @click="setCookies()"
        >
          Ok
        </v-btn>
      </v-flex>
    </v-layout>
  </v-snackbar>
</template>

<script>
import { mapMutations, mapState } from 'vuex';
import { relativeTimeThreshold } from 'moment';

export default {
  name: 'SpluseinsCookieSnackbar',
  data() {
    return {
      cookieDecision: "analytics"
    };
  },
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
      if (this.browserStateReady) {
        if (this.allowAllCookies == false) {
          this.$matomo.disableCookies();
          this.$matomo.deleteCookies();
          this.$matomo.setConsentGiven();
        }
        if (this.allowAllCookies == true) {
          this.$matomo.rememberConsentGiven();
        }
      }
    },
  },
  methods: {
    ...mapMutations({
      setNecessaryCookiesAllowed: 'privacy/setNecessaryCookiesAllowed',
      setAllCookiesAllowed: 'privacy/setAllCookiesAllowed',
      setAllCookiesDenied: 'privacy/setAllCookiesDenied',
    }),
    setCookies(){
      if(this.cookieDecision.includes("nothing")){
        this.setAllCookiesDenied()
      }else if(this.cookieDecision.includes("settings")){
        this.setNecessaryCookiesAllowed()
      }else if(this.cookieDecision.includes("analytics")){
        this.setAllCookiesAllowed()
      }
    }
  },
};
</script>
