<template>
  <v-dialog v-model="dialogOpen" max-width="400">
    <v-card :title="`${plan.name} löschen?`">
      <v-card-actions>
        <v-spacer />
        <v-btn @click="dialogOpen = false"> Abbrechen </v-btn>
        <v-btn color="error" @click="confirmDelete()"> Löschen </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { useSplusStore } from '../stores/splus';
import { planKey } from '../lib/plans';

const props = defineProps({
  plan: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits(['on-delete']);
/* v-model: whether the dialog is open */
const dialogOpen = defineModel({ type: Boolean, default: false });

function confirmDelete() {
  dialogOpen.value = false;
  useSplusStore().deletePlan(planKey(props.plan));
  emit('on-delete');
}
</script>
