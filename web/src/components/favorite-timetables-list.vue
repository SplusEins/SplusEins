<template>
  <v-list>
    <v-list-subheader> Favoriten </v-list-subheader>
    <v-list-item
      v-for="schedule in favoriteSchedules"
      :key="schedule.id"
      :to="schedule.route"
      :title="schedule.description"
    />
  </v-list>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useSplusStore } from '../stores/splus';

const { favoriteSchedules } = storeToRefs(useSplusStore());
</script>
