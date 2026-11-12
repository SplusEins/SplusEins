<template>
  <v-list>
    <v-list-subheader> Personalisierte Pläne </v-list-subheader>

    <v-list-item
      v-for="route in customSchedulesAsRoutes"
      :key="route.query.name"
      :to="route"
      :active="route.query.name === $route.query.name"
      :title="route.query.name"
    />
  </v-list>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useSplusStore } from '../stores/splus';

const { customTimetablesAsRoutes: customSchedulesAsRoutes } =
  storeToRefs(useSplusStore());
</script>
