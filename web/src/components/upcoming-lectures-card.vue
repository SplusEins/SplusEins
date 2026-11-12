<template>
  <v-card class="fill-height">
    <v-card-title class="d-flex align-center">
      <span class="text-headline-small text-wrap mr-1">Nächste Vorlesung</span>
      <v-btn
        v-show="hasSubscribableTimetables"
        :icon="mdiMenuDown"
        variant="text"
        aria-label="Plan auswählen"
        @click="dialogOpen = true"
      />
    </v-card-title>

    <v-card-text v-if="nextEvent !== undefined">
      <b>{{ nextEvent.title }} {{ nextEvent.lecturer }}</b>
      <br />
      <span class="text-medium-emphasis">Datum:</span>
      {{ nextEvent.start.format('dddd, DD.MM.YYYY') }}
      <br />
      <span class="text-medium-emphasis">Uhrzeit:</span>
      {{ nextEvent.start.format('H:mm') }}
      Uhr
      <br />
      <span v-if="!!nextEvent.room">
        <span class="text-medium-emphasis">Raum: </span>
        {{ nextEvent.room }}
      </span>
    </v-card-text>
    <v-card-text v-else-if="hasSubscribableTimetables">
      <i>Keine weiteren Vorlesungen in dieser Woche!</i>
    </v-card-text>
    <v-card-text v-else>
      <i
        >Markiere einen Stundenplan als Favoriten, um ihn hier anzuzeigen.
        Alternativ kannst du auch einen personalisierten Plan erstellen.</i
      >
    </v-card-text>

    <select-dialog
      v-model:open="dialogOpen"
      v-model:selected="selectedItem"
      :items="subscribableTimetables"
      title="Plan abonnieren"
    />
  </v-card>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { mdiMenuDown } from '@mdi/js';
import dayjs from '../lib/dayjs';
import { roomWithoutLinks } from '../lib/util';
import { useSplusStore } from '../stores/splus';
import SelectDialog from './select-dialog.vue';

const splus = useSplusStore();
const {
  subscribedTimetable: selectedItem,
  subscribableTimetables,
  hasSubscribableTimetables,
} = storeToRefs(splus);

const dialogOpen = ref(false);

// Refresh current date so the nextEvent is reevaluated every now and then without a manual refresh from the user
const now = ref(Date.now());
const refreshTimer = setInterval(() => (now.value = Date.now()), 60 * 1000);
onUnmounted(() => clearInterval(refreshTimer));

const nextEvent = computed(() => {
  const possibleEvents = splus.upcomingEvents
    .map((event) => ({
      title: event.title,
      room: roomWithoutLinks(event.location),
      lecturer: event.meta.organiserName,
      start: dayjs(event.start),
    }))
    // Find the next event or use the current event if it's only x minutes ago
    .filter((event) => event.start.valueOf() - now.value > -15 * 60 * 1000)
    .sort((a, b) => a.start.valueOf() - b.start.valueOf());
  return possibleEvents[0];
});

function load() {
  if (selectedItem.value.id) {
    splus.setUpcomingLecturesTimetable(selectedItem.value);
    splus.loadUpcomingEvents();
  }
}
onMounted(load);
watch(selectedItem, load);
</script>
