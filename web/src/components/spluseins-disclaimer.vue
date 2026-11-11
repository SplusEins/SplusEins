<template>
  <v-dialog :model-value="dialogOpen" persistent width="500">
    <v-card>
      <v-card-title class="bg-primary"> Hinweis </v-card-title>
      <v-card-text class="pt-4 pb-0">
        <p class="mb-4">
          SplusEins ist ein inoffizielles Projekt, erstellt von Studis.
        </p>
        <p class="mb-4">
          Manchmal fehlen Stundenpläne ganz oder es gibt Fehler. Nutze dann
          stattdessen den offiziellen
          <a href="http://stundenplan.ostfalia.de/"> stundenplan.ostfalia.de</a
          >.
        </p>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" @click="dismissDisclaimer()"> Verstanden </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue';
import { useUiStore } from '../stores/ui';
import { useSplusStore } from '../stores/splus';

const ui = useUiStore();
const splus = useSplusStore();
const { dismissDisclaimer } = ui;

const dialogOpen = computed(
  () => !ui.hasSeenDisclaimer && !splus.hasSubscribableTimetables,
);
</script>
