<template>
  <v-snackbar
    :model-value="errorQueue.length > 0"
    :timeout="-1"
    color="error"
    location="bottom right"
  >
    [{{ errorQueue.length }}] {{ errorQueue[0] }}
    <template #actions>
      <v-btn @click="dequeueError()"> Schließen </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useAppStore } from '../stores/app';

const app = useAppStore();
const { errorQueue } = storeToRefs(app);
const { dequeueError } = app;
</script>
