<!-- Dialog to choose one of the items. -->
<template>
  <v-dialog v-model="dialogOpen" max-width="400">
    <v-card>
      <v-toolbar color="surface">
        <v-btn :icon="mdiClose" aria-label="Schließen" @click="close()" />
        <v-toolbar-title>{{ title }}</v-toolbar-title>
      </v-toolbar>

      <v-list>
        <v-list-item
          v-for="item in items"
          :key="itemText(item)"
          :title="itemText(item)"
          @click="select(item)"
        >
          <template #prepend>
            <!-- hidden instead of left out, so that all titles are aligned -->
            <v-icon
              :icon="mdiCheck"
              :style="{
                visibility:
                  itemText(item) === itemText(selected) ? 'visible' : 'hidden',
              }"
            />
          </template>
        </v-list-item>
      </v-list>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { mdiClose, mdiCheck } from '@mdi/js';

const props = defineProps({
  title: {
    type: String,
    default: 'Titel',
  },
  items: {
    type: Array,
    default: () => [],
  },
  /* text of an item */
  itemTitle: {
    type: Function,
    default: (item) => item.description || item.label,
  },
});
/* v-model:open: whether the dialog is open */
const dialogOpen = defineModel('open', { type: Boolean, default: false });
/* v-model:selected: the chosen item */
const selected = defineModel('selected', { type: Object, default: () => ({}) });

function itemText(item) {
  return item && props.itemTitle(item);
}
function select(item) {
  selected.value = item;
  close();
}
function close() {
  dialogOpen.value = false;
}
</script>
