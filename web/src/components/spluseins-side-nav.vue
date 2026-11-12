<template>
  <v-navigation-drawer v-model="drawer" width="350">
    <basic-utilities-list />
    <v-divider v-if="hasCustomTimetables" />
    <custom-timetables-list v-if="hasCustomTimetables" />
    <v-divider v-if="hasFavoriteTimetables" />
    <favorite-timetables-list v-if="hasFavoriteTimetables" />
    <v-divider />
    <general-timetables-list />
    <template #append>
      <install-button-list />
      <v-divider />
      <spluseins-footer />
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useUiStore } from '../stores/ui';
import { useSplusStore } from '../stores/splus';
import GeneralTimetablesList from './general-timetables-list.vue';
import FavoriteTimetablesList from './favorite-timetables-list.vue';
import CustomTimetablesList from './custom-timetables-list.vue';
import InstallButtonList from './install-button-list.vue';
import BasicUtilitiesList from './basic-utilities-list.vue';
import SpluseinsFooter from './spluseins-footer.vue';

const splus = useSplusStore();
const { sidenavIsOpen: drawer } = storeToRefs(useUiStore());

const hasCustomTimetables = computed(
  () => Object.keys(splus.customSchedules).length > 0,
);
const hasFavoriteTimetables = computed(
  () => splus.favoriteSchedules.length > 0,
);
</script>

<style>
/* show long timetable names completely */
.v-navigation-drawer .v-list-item-title {
  white-space: normal;
}
</style>
