<template>
  <v-snackbar
    :value="snackbarOpen"
    :timeout="0"
    right>
    Als App installieren?
    <v-layout
      justify-end
      fluid
      row>
      <v-btn
        ref="btn-deny"
        flat
        icon
        @click="hide()">
        Nein
      </v-btn>
      <v-btn
        ref="btn-allow"
        color="success"
        flat
        @click="install()">
        Installieren
      </v-btn>
    </v-layout>
  </v-snackbar>
</template>

<script>
export default {
  name: 'SpluseinsPwaSnackbar',
  data() {
    return {
      snackbarOpen: true,
      deferredPrompt: undefined,
    };
  },
  mounted() {
    // See https://developers.google.com/web/fundamentals/app-install-banners/
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      this.deferredPrompt = e;
      this.show();
    });
  },
  methods: {
    async install() {
      this.hide();
      // Show the prompt
      this.deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const choice = await this.deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }

      this.deferredPrompt = undefined;
    },
    show() {
      this.snackbarOpen = true;
    },
    hide() {
      this.snackbarOpen = false;
    },
  },
};
</script>