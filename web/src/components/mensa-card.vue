<template>
  <v-card class="fill-height d-flex flex-column">
    <v-card-title class="d-flex align-center pb-1">
      <div class="text-headline-small text-wrap mr-1">
        {{ selectedLocation.description }}
        {{ isPlanOfToday ? 'Heute' : 'Morgen' }}
      </div>
      <v-btn
        v-if="availableLocations.length > 0"
        v-tooltip:end="'Mensa auswählen'"
        :icon="mdiMenuDown"
        variant="text"
        aria-label="Mensa auswählen"
        @click="dialogOpen = true"
      />
    </v-card-title>
    <v-card-text class="pb-0">
      <template v-if="mensaMenus.length > 0">
        <div
          v-for="(item, idx) in mensaMenus"
          :key="item.id || idx"
          class="py-2"
        >
          <b>{{ item.lane }}:</b>
          <br />
          <span>{{ item.name }}</span>
        </div>
      </template>
      <div v-else>
        <i>Kein Menü verfügbar.</i>
      </div>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn to="/mensa" color="primary"> Mehr </v-btn>
    </v-card-actions>
    <select-dialog
      v-model:open="dialogOpen"
      v-model:selected="selectedLocation"
      :items="availableLocations"
      title="Standort auswählen"
    />
  </v-card>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { mdiMenuDown } from '@mdi/js';
import dayjs from '../lib/dayjs';
import { useMensaStore } from '../stores/mensa';
import SelectDialog from './select-dialog.vue';

const CITY_TO_KEY = {
  wolfenbüttel: 'wf',
  wolfsburg: 'wob',
  salzgitter: 'sz',
  suderburg: 'sud',
};

const mensa = useMensaStore();
const dialogOpen = ref(false);

const availableLocations = computed(() => {
  if (!mensa.plans) return [];

  const seen = new Set();
  return mensa.plans
    .map((plan) => {
      const city = plan?.address?.city?.toLowerCase();
      const key = CITY_TO_KEY[city];
      if (!key || seen.has(key)) return null;

      seen.add(key);
      const title = plan?.address?.line1 || plan.name || 'Mensa Wolfenbüttel';

      return { key, description: title };
    })
    .filter(Boolean);
});

const selectedLocation = computed({
  get() {
    const found = availableLocations.value.find(
      (l) => l.key === mensa.location,
    );
    return (
      found ||
      availableLocations.value[0] || {
        key: 'wf',
        description: 'Mensa Wolfenbüttel',
      }
    );
  },
  set(value) {
    mensa.setLocation(value.key);
  },
});

const mensaMenus = computed(() =>
  (mensa.getNextAvailablePlan?.meals || []).filter((m) =>
    m?.lane?.startsWith('Essen '),
  ),
);

const isPlanOfToday = computed(() =>
  mensa.getNextAvailablePlan?.date
    ? dayjs().isSame(mensa.getNextAvailablePlan.date, 'day')
    : false,
);

onMounted(async () => {
  await mensa.load();
  if (!mensa.location && availableLocations.value.length > 0) {
    mensa.setLocation(availableLocations.value[0].key);
  }
});
</script>
