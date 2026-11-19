<template>
  <v-card>
    <v-card-title class="text-headline-small">Als Nächstes</v-card-title>

    <v-card-text v-if="!splus.hasSubscribableTimetables">
      Öffne deinen Stundenplan und markiere ihn mit
      <v-icon :icon="mdiHeartOutline" size="small" aria-label="Herz" />
      als Favoriten, um hier deine nächsten Vorlesungen zu sehen.
    </v-card-text>

    <v-skeleton-loader v-else-if="loading" type="list-item-two-line@3" />

    <v-card-text v-else-if="events.length === 0">
      Keine Vorlesungen in den nächsten zwei Wochen.
    </v-card-text>

    <v-list v-else class="agenda pt-0">
      <template v-for="(event, i) in events" :key="event.key">
        <template v-if="i === 0 || event.day !== events[i - 1].day">
          <v-divider v-if="i > 0" class="my-2" />
          <div class="v-list-item-title font-weight-bold px-4 py-1">
            {{ event.day }}
          </div>
        </template>
        <v-list-item @click="showEvent(event)">
          <template #prepend>
            <div class="d-flex flex-column mr-4 text-body-medium">
              <span class="font-weight-medium">
                {{ event.start.format('HH:mm') }}
              </span>
              <span class="text-medium-emphasis">
                {{ event.end.format('HH:mm') }}
              </span>
            </div>
          </template>
          <div
            v-if="event.running"
            class="text-label-medium font-weight-bold text-primary"
          >
            Jetzt · noch {{ event.end.diff(now, 'minute') }} min
          </div>
          <v-list-item-title class="text-wrap font-weight-medium">
            <v-icon
              :icon="mdiCircle"
              :color="event.color"
              size="8"
              class="mr-1 mb-1"
            />
            {{ event.name }}
          </v-list-item-title>
          <v-list-item-subtitle v-if="event.room">
            <v-icon :icon="mdiMapMarkerOutline" size="14" class="mb-1" />
            {{ event.room }}
          </v-list-item-subtitle>
        </v-list-item>
      </template>
    </v-list>

    <calendar-event-popover v-model="selectedOpen" :event="selected" />

    <v-card-actions
      v-if="splus.hasSubscribableTimetables"
      class="flex-wrap ga-2 px-4"
    >
      <v-chip
        v-for="plan in plans"
        :key="plan.name"
        :to="plan.route"
        :append-icon="mdiChevronRight"
        variant="outlined"
        label
      >
        {{ plan.name }}
      </v-chip>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import {
  mdiChevronRight,
  mdiCircle,
  mdiHeartOutline,
  mdiMapMarkerOutline,
} from '@mdi/js';
import dayjs from '../lib/dayjs';
import { useSplusStore } from '../stores/splus';
import { relativeDay, timetablePlan } from '../lib/util';
import { useNow } from '../lib/now';
import CalendarEventPopover from './calendar-event-popover.vue';

const MAX_EVENTS = 5;
const MAX_DAYS = 2;

const splus = useSplusStore();
const loading = ref(false);
const selected = ref(undefined);
const selectedOpen = ref(false);

function showEvent(event) {
  selected.value = event;
  selectedOpen.value = true;
}
const plans = computed(() => splus.subscribableTimetables.map(timetablePlan));

const now = useNow();

const events = computed(() => {
  const seen = new Set();
  const upcoming = splus.agendaEvents
    .map((event) => {
      const start = dayjs(event.start);
      const end = dayjs(event.end);
      const room = (event.location || '')
        .split(' / ')
        .map((location) => location.split(/ \(| Link: /)[0])
        .join(' / ');
      return {
        ...event,
        key: `${event.name}|${event.start}|${room}`,
        room,
        day: relativeDay(start, now.value) ?? start.format('dddd, DD.MM.'),
        start,
        end,
        running: start.valueOf() <= now.value,
      };
    })
    .filter((event) => event.end.valueOf() > now.value)
    .filter((event) => !seen.has(event.key) && seen.add(event.key))
    .sort((a, b) => a.start.valueOf() - b.start.valueOf());
  const days = [...new Set(upcoming.map((event) => event.day))].slice(
    0,
    MAX_DAYS,
  );
  return upcoming
    .filter((event) => days.includes(event.day))
    .slice(0, MAX_EVENTS);
});

async function load() {
  if (!splus.hasSubscribableTimetables) return;
  loading.value = splus.agendaEvents.length === 0;
  await splus.loadAgendaEvents();
  loading.value = false;
}
onMounted(load);
watch(() => splus.subscribableTimetables, load);
</script>
