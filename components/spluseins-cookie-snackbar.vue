<template>
  <v-snackbar
    :value="snackbarOpen"
    :timeout="0"
    right>
    Einstellungen im Browser speichern?
    <v-layout
      justify-space-between
      fluid
      row>
      <v-btn
        ref="btn-deny"
        flat
        icon
        @click="setCookiesDenied()">
        Nein
      </v-btn>
      <v-btn
        ref="btn-allow"
        color="success"
        flat
        @click="setCookiesAllowed()">
        Erlauben
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
      return this.allowCookies == undefined;
    },
    ...mapState({
      allowCookies: state => state.privacy.allowCookies,
    }),
  },
  methods: {
    ...mapMutations({
      setCookiesAllowed: 'privacy/setCookiesAllowed',
      setCookiesDenied: 'privacy/setCookiesDenied',
    }),
  },
};
</script>