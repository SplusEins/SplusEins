<template>
  <v-list>
    <v-list-item to="/" :prepend-icon="mdiHome" title="Startseite" />
    <v-list-item
      :prepend-icon="mdiPlus"
      title="Personalisierter Plan"
      @click="customTimetableDialogOpen = true"
    />
    <v-list-item to="/mensa" :prepend-icon="mdiFoodForkDrink" title="Mensa" />
    <v-list-item to="/bus" :prepend-icon="mdiBus" title="Busse Wolfenbüttel" />

    <custom-timetable-dialog v-model="customTimetableDialogOpen" />
  </v-list>
</template>

<script setup>
import { ref } from 'vue';
import { mdiHome, mdiPlus, mdiFoodForkDrink, mdiBus } from '@mdi/js';
import CustomTimetableDialog from './custom-timetable-dialog.vue';

const customTimetableDialogOpen = ref(false);
</script>
