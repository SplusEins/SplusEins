<template>
  <v-container class="pa-0" fluid>
    <v-list>
      <v-list-item
        :prepend-icon="mdiPlus"
        base-color="primary"
        title="Personalisierten Plan erstellen"
        @click="customTimetableDialogOpen = true"
      />
      <custom-timetable-dialog v-model="customTimetableDialogOpen" />
    </v-list>
    <custom-timetables-list v-if="hasCustomTimetables" />
    <favorite-timetables-list v-if="splus.favoriteSchedules.length > 0" />
    <v-divider v-if="splus.hasSubscribableTimetables" />
    <general-timetables-list />
  </v-container>
</template>

<script setup>
import { computed, ref } from 'vue';
import { mdiPlus } from '@mdi/js';
import { useSplusStore } from '../stores/splus';
import GeneralTimetablesList from '../components/general-timetables-list.vue';
import FavoriteTimetablesList from '../components/favorite-timetables-list.vue';
import CustomTimetablesList from '../components/custom-timetables-list.vue';
import CustomTimetableDialog from '../components/custom-timetable-dialog.vue';

const splus = useSplusStore();
const customTimetableDialogOpen = ref(false);

const hasCustomTimetables = computed(
  () => Object.keys(splus.customSchedules).length > 0,
);
</script>
