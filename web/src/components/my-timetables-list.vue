<template>
  <v-list lines="two">
    <v-list-subheader>Deine Pläne</v-list-subheader>
    <v-list-item
      v-for="schedule in splus.customSchedules"
      :key="schedule.label"
      :to="customTimetableToRoute(schedule)"
      :active="schedule.label === $route.query.name"
      :title="schedule.label"
      :subtitle="`Eigener Plan · ${courseCount(schedule.whitelist.length)}`"
    />
    <timetable-list-item
      v-for="schedule in splus.favoriteSchedules"
      :key="schedule.id"
      :timetable="schedule"
      subtitle
    />
    <slot />
  </v-list>
</template>

<script setup>
import { useSplusStore } from '../stores/splus';
import { courseCount, customTimetableToRoute } from '../lib/util';
import TimetableListItem from './timetable-list-item.vue';

const splus = useSplusStore();
</script>
