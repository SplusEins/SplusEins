<template>
  <v-card class="fill-height">
    <v-card-title class="text-headline-small">Schnellzugriff</v-card-title>
    <custom-timetables-list v-if="hasCustom" title="" />
    <v-divider v-if="hasCustom && hasFavorites" />
    <favorite-timetables-list v-if="hasFavorites" title="" />
  </v-card>
</template>

<script setup>
import { computed } from 'vue';
import { useSplusStore } from '../stores/splus';
import CustomTimetablesList from './custom-timetables-list.vue';
import FavoriteTimetablesList from './favorite-timetables-list.vue';

const splus = useSplusStore();
const hasCustom = computed(() => splus.customTimetableLabels.length > 0);
const hasFavorites = computed(() => splus.favoriteSchedules.length > 0);
</script>
