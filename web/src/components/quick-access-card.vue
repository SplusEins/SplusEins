<template>
  <v-card class="fill-height">
    <v-card-title class="text-headline-small">Schnellzugriff</v-card-title>
    <v-list v-if="customSchedulesAsRoutes.length != 0">
      <v-list-item
        v-for="route in customSchedulesAsRoutes"
        :key="route.query.name"
        :to="route"
        :title="route.query.name"
      />
    </v-list>
    <v-divider v-if="displayDivider" />
    <v-list v-if="favorites.length != 0">
      <v-list-item
        v-for="favorite in favorites"
        :key="favorite.id"
        :to="favorite.route"
        :title="favorite.description"
      />
    </v-list>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useSplusStore } from '../stores/splus';

const {
  favoriteSchedules: favorites,
  customTimetablesAsRoutes: customSchedulesAsRoutes,
} = storeToRefs(useSplusStore());

const displayDivider = computed(
  () =>
    favorites.value.length !== 0 && customSchedulesAsRoutes.value.length !== 0,
);
</script>
