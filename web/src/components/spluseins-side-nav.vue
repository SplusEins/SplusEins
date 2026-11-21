<template>
  <v-navigation-drawer v-model="drawer" width="350">
    <basic-utilities-list />
    <template v-if="splus.hasPlans">
      <v-divider />
      <my-timetables-list />
    </template>
    <v-divider />
    <timetable-search>
      <general-timetables-list />
    </timetable-search>
    <template #append>
      <install-button-list />
      <v-divider />
      <spluseins-footer />
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useUiStore } from '../stores/ui';
import { useSplusStore } from '../stores/splus';
import TimetableSearch from './timetable-search.vue';
import MyTimetablesList from './my-timetables-list.vue';
import GeneralTimetablesList from './general-timetables-list.vue';
import InstallButtonList from './install-button-list.vue';
import BasicUtilitiesList from './basic-utilities-list.vue';
import SpluseinsFooter from './spluseins-footer.vue';

const splus = useSplusStore();
const { sidenavIsOpen: drawer } = storeToRefs(useUiStore());
</script>

<style>
/* show long timetable names completely */
.v-navigation-drawer .v-list-item-title {
  white-space: normal;
}
</style>
