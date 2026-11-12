<template>
  <v-card class="fill-height">
    <v-card-title class="text-headline-small">Als Nächstes</v-card-title>

    <v-card-text v-if="!splus.hasSubscribableTimetables">
      <p :class="{ 'mb-4': $vuetify.display.mobile }">
        Markiere einen Stundenplan als Favoriten, um hier deine nächsten
        Vorlesungen zu sehen. Alternativ kannst du einen personalisierten Plan
        erstellen.
      </p>
      <!-- desktop has the plans in the drawer -->
      <v-btn
        v-if="$vuetify.display.mobile"
        color="primary"
        variant="flat"
        to="/plaene"
      >
        Plan auswählen
      </v-btn>
    </v-card-text>

    <v-skeleton-loader v-else-if="loading" type="list-item-two-line@3" />

    <v-card-text v-else-if="events.length === 0">
      Keine Vorlesungen in den nächsten zwei Wochen.
    </v-card-text>

    <v-list v-else class="pt-0">
      <template v-for="(event, i) in events" :key="event.key">
        <v-list-subheader v-if="i === 0 || event.day !== events[i - 1].day">
          {{ event.day }}
        </v-list-subheader>
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
          <v-list-item-title class="text-wrap font-weight-medium">
            {{ event.title }}
          </v-list-item-title>
          <v-list-item-subtitle>
            <a v-if="event.roomUrl" :href="event.roomUrl" target="_blank">
              {{ event.room }}
            </a>
            <span v-else>{{ event.room }}</span>
            ·
            <router-link :to="event.plan.route" class="text-medium-emphasis">
              {{ event.plan.name }}
            </router-link>
          </v-list-item-subtitle>
          <v-list-item-subtitle
            v-if="event.running"
            class="font-weight-bold text-primary"
          >
            Jetzt · noch {{ event.end.diff(now, 'minute') }} min
          </v-list-item-subtitle>
        </v-list-item>
      </template>
    </v-list>
  </v-card>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import dayjs from '../lib/dayjs';
import { useSplusStore } from '../stores/splus';

const MAX_EVENTS = 6;

const splus = useSplusStore();
const loading = ref(false);

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
  return splus.agendaEvents
    .map((event) => {
      const start = dayjs(event.start);
      const end = start.add(event.duration, 'hours');
      const [room, roomUrl] = (event.location || '').split(' Link: ');
      return {
        key: `${event.title}|${event.start}|${room}`,
        title: event.title,
        room: room.split(' (')[0],
        roomUrl,
        plan: event.plan,
        day: dayLabel(start),
        start,
        end,
        running: start.valueOf() <= now.value,
      };
    })
    .filter((event) => event.end.valueOf() > now.value)
    .filter((event) => !seen.has(event.key) && seen.add(event.key))
    .sort((a, b) => a.start.valueOf() - b.start.valueOf())
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
