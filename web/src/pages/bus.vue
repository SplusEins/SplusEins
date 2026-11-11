<template>
  <v-container fluid class="mt-3 px-4">
    <v-row justify="center">
      <v-col
        v-for="direction in directions"
        :key="direction"
        cols="12"
        md="5"
        xl="4"
      >
        <v-card v-if="departures" class="pa-2">
          <v-card-title class="text-headline-small">
            {{ directionLabel[direction] }}
          </v-card-title>

          <v-list>
            <!-- use composite key to ensure we have only unique keys (date only won't be unique if a bus is late) -->
            <v-list-item
              v-for="(departure, index) in removePastDepartures(
                departures[direction],
              )"
              :key="departure.date + '-' + departure.line + '-' + index"
            >
              <v-chip
                variant="outlined"
                :color="lineColor(departure.line)"
                class="mr-2"
              >
                Linie {{ departure.line }}
              </v-chip>
              {{ absoluteDate(departure.date) }} Uhr
              <template v-if="minutesUntilDate(departure.date) < 15">
                ({{ relativeDate(departure.date) }})
              </template>
            </v-list-item>
          </v-list>
        </v-card>
        <v-skeleton-loader v-else type="article" />
      </v-col>
    </v-row>
    <span class="pt-4 d-flex justify-end text-body-small text-medium-emphasis">
      Quelle:&nbsp;
      <a href="https://transitous.org/" class="link"> Transitous </a>
    </span>
    <span
      v-if="lastUpdated"
      class="d-flex justify-end text-body-small text-medium-emphasis"
    >
      Zuletzt aktualisiert:
      {{ formatTime(lastUpdated) }} Uhr
    </span>
  </v-container>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import dayjs from '../lib/dayjs';
import { useBusStore } from '../stores/bus';

const bus = useBusStore();
const { departures, lastUpdated } = storeToRefs(bus);

const directions = ['exerToFh', 'fhToExer'];
const directionLabel = {
  exerToFh: 'Exer zu Fachhochschule',
  fhToExer: 'Fachhochschule zu Exer',
};

// load now and then every minute
let refreshTimer;
onMounted(() => {
  bus.load();
  refreshTimer = setInterval(() => bus.load(), 60000);
});
onUnmounted(() => clearInterval(refreshTimer));

const relativeDate = (str) => dayjs(str).fromNow();
const absoluteDate = (str) => dayjs(str).format('HH:mm');
const formatTime = (str) => dayjs(str).format('HH:mm:ss');
const minutesUntilDate = (str) => dayjs(str).diff(dayjs(), 'minutes');
const lineColor = (line) => ['pink', 'purple', 'blue'][parseInt(line) % 4];

function removePastDepartures(departures) {
  // remove all departures older than 10 minutes ago
  return departures
    ? departures.filter((dep) => minutesUntilDate(dep.date) > -10)
    : [];
}
</script>
