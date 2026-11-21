<template>
  <v-card>
    <v-card-title class="text-headline-small">Als Nächstes</v-card-title>

    <template v-if="!splus.hasPlans">
      <v-card-text class="pb-0">
        Such deinen Stundenplan und merke ihn dir mit
        <v-icon :icon="mdiHeartOutline" size="small" aria-label="Herz" />, dann
        stehen hier deine nächsten Vorlesungen.
      </v-card-text>
      <timetable-search />
    </template>

    <v-skeleton-loader v-else-if="loading" type="list-item-two-line@3" />

    <v-card-text v-else-if="events.length === 0">
      Keine Vorlesungen in den nächsten zwei Wochen.
    </v-card-text>

    <v-list v-else class="agenda pt-0">
      <template v-for="(event, i) in events" :key="event.key">
        <template v-if="i === 0 || event.day !== events[i - 1].day">
          <v-divider v-if="i > 0" class="mx-4 my-3" />
          <div class="text-body-large font-weight-bold px-4 py-1">
            {{ event.day }}
          </div>
        </template>
        <v-list-item @click="showEvent(event)">
          <div class="d-flex align-start">
            <div class="d-flex flex-column mr-4 text-body-medium">
              <span class="font-weight-medium">
                {{ event.start.format('HH:mm') }}
              </span>
              <span class="text-medium-emphasis">
                {{ event.end.format('HH:mm') }}
              </span>
            </div>
            <div
              class="rounded-pill align-self-stretch mr-3"
              :style="{ width: '3px', background: event.color }"
            />
            <div>
              <div
                v-if="event.running"
                class="text-label-medium font-weight-bold text-primary"
              >
                Jetzt · noch {{ event.end.diff(now, 'minute') }} min
              </div>
              <v-list-item-title
                class="text-wrap text-body-large font-weight-medium"
              >
                {{ event.name }}
              </v-list-item-title>
              <v-list-item-subtitle v-if="event.location">
                <v-icon :icon="mdiMapMarkerOutline" size="14" class="mb-1" />
                {{ event.location }}
              </v-list-item-subtitle>
            </div>
          </div>
        </v-list-item>
      </template>
    </v-list>

    <calendar-event-popover v-model="selectedOpen" :event="selected" />

    <v-card-actions v-if="mobile && splus.hasPlans" class="flex-wrap ga-2 px-4">
      <v-chip
        v-for="plan in plans"
        :key="plan.name"
        :to="plan.route"
        :append-icon="mdiChevronRight"
        variant="outlined"
        label
      >
        <template #prepend>
          <v-icon
            :icon="mdiCircle"
            :color="plan.color"
            size="10"
            class="mr-2"
          />
        </template>
        {{ plan.name }}
      </v-chip>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useDisplay } from 'vuetify';
import {
  mdiChevronRight,
  mdiCircle,
  mdiHeartOutline,
  mdiMapMarkerOutline,
} from '@mdi/js';
import dayjs from '../lib/dayjs';
import { planColor, useSplusStore } from '../stores/splus';
import { relativeDay } from '../lib/util';
import { planLink } from '../lib/plans';
import { useNow } from '../lib/now';
import CalendarEventPopover from './calendar-event-popover.vue';
import TimetableSearch from './timetable-search.vue';

const MAX_EVENTS = 5;
const MAX_DAYS = 2;
const CHIP_LABEL_LENGTH = 24;

const splus = useSplusStore();
const { mobile } = useDisplay();
const loading = ref(false);
const selected = ref(undefined);
const selectedOpen = ref(false);

function showEvent(event) {
  selected.value = event;
  selectedOpen.value = true;
}
const plans = computed(() =>
  splus.plans.map((plan, i) => ({
    ...planLink(plan, CHIP_LABEL_LENGTH),
    color: planColor(i),
  })),
);

const now = useNow();

const events = computed(() => {
  const seen = new Set();
  const upcoming = splus.agendaEvents
    .map((event) => {
      const start = dayjs(event.start);
      const end = dayjs(event.end);
      return {
        ...event,
        key: `${event.name}|${event.start}|${event.location}`,
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
  if (!splus.hasPlans) return;
  loading.value = splus.agendaEvents.length === 0;
  await splus.loadAgendaEvents();
  loading.value = false;
}
onMounted(load);
watch(() => splus.plans, load);
</script>
