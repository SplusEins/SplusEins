<template>
  <v-container fluid>
    <v-tabs v-model="currentTab" center-active show-arrows>
      <v-tab v-for="(item, idx) in plans" :key="item.id" :value="idx">
        {{ item.name }}
        <v-chip
          v-if="isOpen(item.opening_hours)"
          v-tooltip:bottom="'Aktuell geöffnet'"
          class="ml-2"
          color="green"
          variant="flat"
          aria-label="Aktuell geöffnet"
        >
          <v-icon :icon="mdiFoodForkDrink" />
        </v-chip>
      </v-tab>
    </v-tabs>

    <v-tabs-window v-model="currentTab">
      <v-tabs-window-item
        v-for="(item, idx) in plans"
        :key="item.id"
        :value="idx"
        class="pa-2 pa-md-4"
      >
        <div class="d-flex align-start flex-wrap" style="row-gap: 8px">
          <div class="d-flex flex-column pr-4" style="max-width: 420px">
            <div class="d-flex align-center text-body-medium mb-1">
              <v-icon
                color="indigo"
                class="mr-2"
                :icon="mdiFolderInformation"
              />
              <a
                :href="getMensaURL(item.url)"
                class="text-decoration-none"
                target="_blank"
                >Offizielle Mensa-Seite mit Öffnungszeiten</a
              >
            </div>

            <div class="d-flex flex-wrap align-center">
              <v-chip class="ma-1" size="small" variant="outlined">
                <v-icon start color="orange" :icon="mdiCarrot" />
                Vegetarisch
              </v-chip>
              <v-chip class="ma-1" size="small" variant="outlined">
                <v-icon start color="green" :icon="mdiSprout" />
                Vegan
              </v-chip>
              <v-chip class="ma-1" size="small" variant="outlined">
                <v-icon start color="red" :icon="mdiCurrencyEur" />
                StudiDeal
              </v-chip>
            </div>
          </div>

          <div class="flex-grow-1">
            <div class="d-flex align-center text-body-medium mb-1">
              <v-icon color="indigo" class="mr-2" :icon="mdiClockOutline" />
              Öffnungszeiten:
            </div>
            <div v-if="item.opening_hours.length > 0" class="d-flex flex-wrap">
              <v-chip
                v-for="(opening, key) in item.opening_hours"
                :key="key"
                class="ma-1"
                variant="outlined"
                size="small"
              >
                <v-icon start :icon="openingTimeIcon(opening)" />
                {{ openingTimeFormat(opening) }}
              </v-chip>
            </div>
            <div v-else class="text-body-medium text-medium-emphasis">
              Bitte vor Ort informieren.
            </div>
          </div>
        </div>

        <v-divider class="my-3" />

        <v-alert v-if="noMealsAvailable(item.dayPlans)" type="info">
          Aktuell sind keine Pläne verfügbar.
        </v-alert>

        <!-- mobile: all days below each other -->
        <v-row v-else-if="$vuetify.display.mobile">
          <v-col v-for="dayPlan in item.dayPlans" :key="dayPlan.date" cols="12">
            <mensa-dayplan :plan="dayPlan" />
          </v-col>
        </v-row>

        <!-- desktop: three days next to each other -->
        <v-carousel v-else hide-delimiters height="auto" :continuous="false">
          <v-carousel-item
            v-for="dayPlanGroup in groupedDayPlans(item.dayPlans)"
            :key="dayPlanGroup[0].date"
          >
            <v-row density="compact" class="carousel-control-padding">
              <v-col v-for="(_, i) in 3" :key="i" cols="4">
                <mensa-dayplan v-if="dayPlanGroup[i]" :plan="dayPlanGroup[i]" />
              </v-col>
            </v-row>
          </v-carousel-item>
        </v-carousel>
      </v-tabs-window-item>
    </v-tabs-window>
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import {
  mdiSprout,
  mdiCurrencyEur,
  mdiCarrot,
  mdiFoodOutline,
  mdiFoodForkDrink,
  mdiClockOutline,
  mdiFolderInformation,
  mdiCoffeeOutline,
  mdiWeatherNight,
} from '@mdi/js';
import dayjs from '../lib/dayjs';
import { useMensaStore } from '../stores/mensa';
import { locationMap } from '../lib/mensa-location-map.js';
import MensaDayplan from '../components/mensa-dayplan.vue';

const mensa = useMensaStore();
const { plans } = storeToRefs(mensa);

onMounted(() => mensa.load());

/* index of the mensa which is selected on the start page */
const defaultTab = computed(() => {
  if (!plans.value || plans.value.length === 0) return 0;
  const mappedName = locationMap[mensa.location] || locationMap.wf;
  const idx = plans.value.findIndex((p) => p.name === mappedName);
  return idx !== -1 ? idx : 0;
});
/* index of the tab the user clicked on */
const selectedTab = ref(undefined);
const currentTab = computed({
  get: () => selectedTab.value ?? defaultTab.value,
  set: (value) => {
    selectedTab.value = value;
  },
});

function getMensaURL(url) {
  return `https://www.stw-on.de/${url}`;
}

function noMealsAvailable(dayPlans) {
  return !dayPlans || dayPlans.length === 0;
}

function isOpen(openingHours) {
  const now = dayjs();
  const currentDay = now.isoWeekday(); // 1 = Montag, 7 = Sonntag
  const currentTime = now.format('HH:mm:ss');

  return openingHours.some(
    (hours) =>
      currentDay >= hours.start_day &&
      currentDay <= hours.end_day &&
      currentTime >= hours.start_time &&
      currentTime <= hours.end_time,
  );
}

/* groups of three days for the carousel */
function groupedDayPlans(dayPlans) {
  const grouped = [];
  for (let i = 0; i < dayPlans.length; i += 3) {
    grouped.push(dayPlans.slice(i, i + 3));
  }
  return grouped;
}

function openingTimeFormat(hours) {
  const formatDay = (day) => dayjs().isoWeekday(day).format('dddd');
  const dayRange =
    hours.start_day === hours.end_day
      ? formatDay(hours.start_day)
      : `${formatDay(hours.start_day)} - ${formatDay(hours.end_day)}`;
  return `${dayRange}, ${hours.start_time.slice(0, 5)}-${hours.end_time.slice(0, 5)}`;
}

function openingTimeIcon(hours) {
  switch (hours.time) {
    case 'morning':
      return mdiCoffeeOutline;
    case 'evening':
      return mdiWeatherNight;
    default:
      return mdiFoodOutline;
  }
}
</script>

<style>
/* leave space for the arrows left and right of the carousel */
.carousel-control-padding {
  padding: 0 50px;
  margin: 0px !important;
}
</style>
