<template>
  <v-bottom-sheet v-model="open" inset>
    <v-list>
      <v-list-subheader>Link teilen</v-list-subheader>
      <v-list-item
        :prepend-icon="mdiContentCopy"
        title="Link in die Zwischenablage kopieren"
        @click="copy()"
      />
    </v-list>
  </v-bottom-sheet>
</template>

<script setup>
import { mdiContentCopy } from '@mdi/js';

const props = defineProps({
  textToCopy: {
    type: String,
    required: true,
  },
});
/* v-model: whether the dialog is open */
const open = defineModel({ type: Boolean, default: false });

function copy() {
  navigator.clipboard.writeText(props.textToCopy);
  open.value = false;
}
</script>
