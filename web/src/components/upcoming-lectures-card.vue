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
        <v-list-item :active="event.running">
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
            {{ event.title }}
          </v-list-item-title>
          <v-list-item-subtitle v-if="event.room">
            <a v-if="event.roomUrl" :href="event.roomUrl" target="_blank">
              {{ event.room }}
            </a>
            <span v-else>{{ event.room }}</span>
          </v-list-item-subtitle>
        </v-list-item>
      </template>
    </v-list>

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
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { mdiChevronRight, mdiCircle, mdiHeartOutline } from '@mdi/js';
import dayjs from '../lib/dayjs';
import { useSplusStore } from '../stores/splus';
import { timetablePlan } from '../lib/util';

const MAX_EVENTS = 5;
const MAX_DAYS = 2;

const splus = useSplusStore();
const loading = ref(false);
const plans = computed(() => splus.subscribableTimetables.map(timetablePlan));

// re-evaluate running and past lectures every minute
const now = ref(Date.now());
const refreshTimer = setInterval(() => (now.value = Date.now()), 60 * 1000);
onUnmounted(() => clearInterval(refreshTimer));

function dayLabel(date) {
  const today = dayjs(now.value);
  if (date.isSame(today, 'day')) return 'Heute';
  if (date.isSame(today.add(1, 'day'), 'day')) return 'Morgen';
  return date.format('dddd, DD.MM.');
}

const events = computed(() => {
  const seen = new Set();
  const upcoming = splus.agendaEvents
    .map((event) => {
      const start = dayjs(event.start);
      const end = start.add(event.duration, 'hours');
      const [room, roomUrl] = (event.location || '').split(' Link: ');
      return {
        key: `${event.title}|${event.start}|${room}`,
        title: event.title,
        room: room.split(' (')[0],
        roomUrl,
        color: event.color,
        day: dayLabel(start),
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

<style scoped>
.agenda a {
  color: inherit;
}
</style>
