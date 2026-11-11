<template>
  <v-container
    v-touch="{
      right: () => setSidenav(true),
    }"
    class="fill-height justify-center"
  >
    <v-card class="pa-2" max-width="600" width="100%">
      <img src="/404.png" alt="" class="d-block mx-auto w-50" />
      <v-card-text class="text-center text-title-large">
        {{ message }}
      </v-card-text>
      <v-card-actions>
        <v-btn to="/" color="primary"> Zurück zur Startseite </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
import { useUiStore } from '../stores/ui';

defineProps({
  message: {
    type: String,
    default: 'Diese Seite gibt es leider nicht...',
  },
});

const { setSidenav } = useUiStore();
</script>
