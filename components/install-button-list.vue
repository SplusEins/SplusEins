<template>
  <div v-show="visible">
    <v-divider />
    <v-list dense>
      <v-list-tile @click="install()">
        <v-list-tile-action>
          <v-icon>get_app</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>Als App installieren</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
  </div>
</template>

<script>
export default {
  name: 'InstallButtonList',
  data() {
    return {
      deferredPrompt: undefined,
    };
  },
  computed: {
    visible() {
      return !!this.deferredPrompt;
    },
  },
  mounted() {
    // See https://developers.google.com/web/fundamentals/app-install-banners/
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      this.deferredPrompt = e;
    });
  },
  methods: {
    async install() {
      // Show the prompt
      this.deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const choice = await this.deferredPrompt.userChoice;
      console.log('User response to A2HS prompt: ', choice.outcome);
      this.deferredPrompt = undefined;
    },
  },
};
</script>