<template>
  <spluseins-calendar v-if="schedule" />
  <not-found-page v-else message="Dieser Plan existiert nicht (mehr)" />
</template>

<script setup>
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useSplusStore } from '../stores/splus';
import { setPageTitle } from '../router';
import SpluseinsCalendar from '../components/spluseins-calendar.vue';
import NotFoundPage from './not-found.vue';

const splus = useSplusStore();
const { schedule } = storeToRefs(splus);

// The timetable is described by the URL:
// /plan/<id> for a regular one or /plan?id=...&course=...&name=... for a personalized one
splus.importSchedule(useRoute());
splus.resetWeek(false);
setPageTitle(splus.scheduleDisplayName());
</script>
