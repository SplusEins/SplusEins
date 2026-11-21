<template>
  <v-bottom-sheet v-model="open" inset>
    <v-list>
      <v-list-subheader>Extern öffnen</v-list-subheader>
      <v-list-item
        :href="httpLink"
        :prepend-icon="mdiDownload"
        title="Aktuelle Daten herunterladen"
        @click="open = false"
      />
      <v-list-item
        :prepend-icon="mdiContentCopy"
        title="Link der Kalenderdatei kopieren"
        @click="copy()"
      />
      <v-list-item
        :href="webcalLink"
        :prepend-icon="mdiOpenInApp"
        title="Link in Kalender-App öffnen"
        @click="open = false"
      />
    </v-list>
  </v-bottom-sheet>
</template>

<script setup>
import { computed } from 'vue';
import { mdiDownload, mdiContentCopy, mdiOpenInApp } from '@mdi/js';

const props = defineProps({
  /* see sourcesToString in lib/plans.ts */
  sources: {
    type: String,
    required: true,
  },
});
/* v-model: whether the dialog is open */
const open = defineModel({ type: Boolean, default: false });

const httpLink = computed(() => {
  return `${window.location.origin}/api/ics/v1/${props.sources}`;
});
const webcalLink = computed(() => httpLink.value.replace(/^https?/i, 'webcal'));

function copy() {
  navigator.clipboard.writeText(httpLink.value);
  open.value = false;
}
</script>
