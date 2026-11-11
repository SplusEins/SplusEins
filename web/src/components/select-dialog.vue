<!-- Dialog to choose one of the items. Each item needs a `description` or a `label`. -->
<template>
  <v-dialog v-model="dialogOpen" max-width="400">
    <v-card>
      <v-toolbar color="primary">
        <v-btn :icon="mdiClose" aria-label="Schließen" @click="close()" />
        <v-toolbar-title>{{ title }}</v-toolbar-title>
      </v-toolbar>

      <v-list>
        <v-list-item
          v-for="item in items"
          :key="itemText(item)"
          :title="itemText(item)"
          :prepend-icon="
            itemText(item) === itemText(selected) ? mdiCheck : 'none'
          "
          @click="select(item)"
        />
      </v-list>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { mdiClose, mdiCheck } from '@mdi/js';

defineProps({
  title: {
    type: String,
    default: 'Titel',
  },
  items: {
    type: Array,
    default: () => [],
  },
});
/* v-model:open: whether the dialog is open */
const dialogOpen = defineModel('open', { type: Boolean, default: false });
/* v-model:selected: the chosen item */
const selected = defineModel('selected', { type: Object, default: () => ({}) });

function itemText(item) {
  return item.description || item.label;
}
function select(item) {
  selected.value = item;
  close();
}
function close() {
  dialogOpen.value = false;
}
</script>
