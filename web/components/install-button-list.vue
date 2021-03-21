<template>
  <div v-show="visible">
    <v-divider />
    <v-list
      subheader
      dense
    >
      <v-list-item @click="install()">
        <v-list-item-action>
          <v-icon>{{ mdiDownload }}</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>Als App installieren</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </div>
</template>

<script>
import { mdiDownload } from '@mdi/js'

export default {
  name: 'InstallButtonList',
  data () {
    return {
      deferredPrompt: undefined,
      mdiDownload
    };
  },
  computed: {
    visible () {
      return !!this.deferredPrompt;
    }
  },
  mounted () {
    // See https://developers.google.com/web/fundamentals/app-install-banners/
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      this.deferredPrompt = e;
    });
  },
  methods: {
    async install () {
      // Show the prompt
      this.deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const choice = await this.deferredPrompt.userChoice;
      this.$matomo.trackEvent('Application', 'installed', choice.outcome);
      this.deferredPrompt = undefined;
    }
  }
};
</script>
