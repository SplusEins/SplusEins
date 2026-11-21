<template>
  <v-container class="pa-0" fluid>
    <timetable-search>
      <my-timetables-list>
        <v-list-item
          :prepend-icon="mdiPlus"
          base-color="primary"
          title="Eigenen Plan zusammenstellen"
          @click="customTimetableDialogOpen = true"
        />
      </my-timetables-list>
      <general-timetables-list />
    </timetable-search>
    <custom-timetable-dialog v-model="customTimetableDialogOpen" />
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { mdiPlus } from '@mdi/js';
import TimetableSearch from '../components/timetable-search.vue';
import MyTimetablesList from '../components/my-timetables-list.vue';
import GeneralTimetablesList from '../components/general-timetables-list.vue';
import CustomTimetableDialog from '../components/custom-timetable-dialog.vue';

const customTimetableDialogOpen = ref(false);
</script>
