<template>
  <v-card class="fill-height">
    <v-card-title class="text-headline-small">Statistik</v-card-title>
    <vc-donut
      :sections="sections"
      :size="230"
      :thickness="30"
      :background="isDark ? '#212121' : 'white'"
      :total="totalHours"
      unit="px"
    >
      <h1>{{ sections.length != 0 ? totalHours.toLocaleString() : 0 }}h</h1>
      diese Woche
    </vc-donut>
    <v-card-text class="card-text">
      <h3>
        {{ subscribedTimetable.description || subscribedTimetable.label }}
      </h3>
      <span
        >{{ sections.length }} {{ sections.length > 1 ? 'Module' : 'Modul' }} an
      </span>
      <span
        >{{ totalWeekdays }}
        {{ totalWeekdays > 1 ? 'Wochentagen' : 'Wochentag' }}</span
      >
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import dayjs from '../lib/dayjs';
import { useSplusStore } from '../stores/splus';
import { useUiStore } from '../stores/ui';

const splus = useSplusStore();
const { upcomingEvents, subscribedTimetable } = storeToRefs(splus);
const { isDark } = storeToRefs(useUiStore());

onMounted(() => splus.loadUpcomingEvents());
watch(subscribedTimetable, () => splus.loadUpcomingEvents());

/* hours of this week per module: Map { title: hours } */
const hoursByTitle = computed(() => {
  const hours = new Map();
  upcomingEvents.value.forEach((event) => {
    hours.set(event.title, (hours.get(event.title) || 0) + event.duration);
  });
  return hours;
});

/* one section of the donut chart per module */
const sections = computed(() =>
  [...hoursByTitle.value].map(([title, hours]) => ({
    label: title + ' - ' + hours.toLocaleString() + ' Stunden',
    value: hours,
  })),
);

const totalHours = computed(() => {
  const sum = [...hoursByTitle.value.values()].reduce((a, b) => a + b, 0);
  // the donut chart needs a total greater than 0
  return sum > 0 ? sum : 1;
});

const totalWeekdays = computed(
  () =>
    new Set(upcomingEvents.value.map((event) => dayjs(event.start).day())).size,
);
</script>

<style>
.card-text {
  text-align: center;
}
</style>
