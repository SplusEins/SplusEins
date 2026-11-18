<template>
  <v-list>
    <v-list-subheader v-if="title">{{ title }}</v-list-subheader>
    <v-list-item
      v-for="schedule in customSchedules"
      :key="schedule.label"
      :to="customTimetableToRoute(schedule)"
      :active="schedule.label === $route.query.name"
      :title="schedule.label"
    />
  </v-list>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useSplusStore } from '../stores/splus';
import { customTimetableToRoute } from '../lib/util';

defineProps({
  title: {
    type: String,
    default: 'Personalisierte Pläne',
  },
});

const { customSchedules } = storeToRefs(useSplusStore());
</script>
