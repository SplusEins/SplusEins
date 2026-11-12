<template>
  <v-list v-show="visible" density="compact" class="pa-0">
    <v-divider />
    <v-list-item
      :prepend-icon="mdiDownload"
      title="Als App installieren"
      @click="install()"
    />
  </v-list>
</template>

<script setup>
import { computed, ref } from 'vue';
import { mdiDownload } from '@mdi/js';

const deferredPrompt = ref(undefined);
const visible = computed(() => !!deferredPrompt.value);

// See https://developer.mozilla.org/en-US/docs/Web/API/BeforeInstallPromptEvent
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the browser from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt.value = e;
});

async function install() {
  // Show the prompt
  deferredPrompt.value.prompt();

  // Wait for the user to respond to the prompt
  await deferredPrompt.value.userChoice;
  deferredPrompt.value = undefined;
}
</script>
