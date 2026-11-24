<template>
  <v-container fluid>
    <div v-if="$vuetify.display.mobile" class="d-flex align-center">
      <h1 class="text-headline-small">{{ mensa.selectedPlan?.name }}</h1>
      <v-btn
        v-if="mensa.plans?.length > 1"
        :icon="mdiMenuDown"
        variant="text"
        density="compact"
        aria-label="Mensa auswählen"
        @click="dialogOpen = true"
      />
    </div>
    <v-tabs v-else v-model="location" show-arrows>
      <v-tab v-for="plan in mensa.plans" :key="plan.key" :value="plan.key">
        {{ plan.name }}
      </v-tab>
    </v-tabs>

    <div class="d-flex flex-wrap align-center ga-4 my-4">
      <v-btn-toggle
        v-model="diet"
        mandatory
        divided
        variant="outlined"
        density="compact"
        rounded="xl"
        color="primary"
      >
        <v-btn
          v-for="option in DIETS"
          :key="option.value"
          :value="option.value"
          :prepend-icon="diet === option.value ? mdiCheck : undefined"
        >
          {{ option.title }}
        </v-btn>
      </v-btn-toggle>
      <a
        v-if="mensa.selectedPlan"
        :href="mensa.selectedPlan.url"
        target="_blank"
        class="text-body-medium"
      >
        Öffnungszeiten beim Studentenwerk
      </a>
      <span class="text-body-small text-medium-emphasis">
        Preise für Studis, darunter für Angestellte
      </span>
    </div>

    <v-alert v-if="dayPlans.length === 0" type="info">
      Aktuell sind keine Pläne verfügbar.
    </v-alert>

    <template v-else-if="$vuetify.display.mobile">
      <v-tabs v-model="dayIdx" show-arrows>
        <v-tab
          v-for="(dayPlan, idx) in dayPlans"
          :key="dayPlan.date"
          :value="idx"
        >
          {{ dayTitle(dayPlan.date, 'dd D.') }}
        </v-tab>
      </v-tabs>
      <v-card border rounded="lg" class="mt-3">
        <mensa-dayplan :plan="dayPlans[dayIdx]" />
      </v-card>
    </template>

    <v-row v-else>
      <v-col
        v-for="dayPlan in dayPlans"
        :key="dayPlan.date"
        cols="12"
        md="6"
        xl="4"
      >
        <v-card border rounded="lg" class="fill-height">
          <v-card-title :class="{ 'text-primary': isToday(dayPlan.date) }">
            {{ dayTitle(dayPlan.date, 'dddd') }}
            <span class="text-body-medium text-medium-emphasis">
              {{ dayjs(dayPlan.date).format('DD.MM.') }}
            </span>
          </v-card-title>
          <v-divider />
          <mensa-dayplan :plan="dayPlan" />
        </v-card>
      </v-col>
    </v-row>

    <select-dialog
      v-model:open="dialogOpen"
      :selected="mensa.selectedPlan"
      :items="mensa.plans ?? []"
      :item-title="(plan) => plan.name"
      title="Standort auswählen"
      @update:selected="(plan) => (location = plan.key)"
    />
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { mdiCheck, mdiMenuDown } from '@mdi/js';
import dayjs from '../lib/dayjs';
import { useMensaStore } from '../stores/mensa';
import MensaDayplan from '../components/mensa-dayplan.vue';
import SelectDialog from '../components/select-dialog.vue';

const DIETS = [
  { value: 'all', title: 'Alle' },
  { value: 'vegetarian', title: 'Vegetarisch' },
  { value: 'vegan', title: 'Vegan' },
];

const mensa = useMensaStore();
const dialogOpen = ref(false);

onMounted(() => mensa.load());

const dayPlans = computed(() => mensa.selectedPlan?.dayPlans ?? []);

const location = computed({
  get: () => mensa.selectedPlan?.key,
  set: (key) => {
    mensa.setLocation(key);
    selectedDayIdx.value = undefined;
  },
});
const diet = computed({
  get: () => mensa.diet,
  set: (value) => mensa.setDiet(value),
});

/* on mobile, the day the user picked, otherwise the next one with meals */
const selectedDayIdx = ref(undefined);
const dayIdx = computed({
  get: () =>
    selectedDayIdx.value ??
    Math.max(0, dayPlans.value.indexOf(mensa.getNextAvailablePlan)),
  set: (value) => {
    selectedDayIdx.value = value;
  },
});

const isToday = (date) => dayjs().isSame(date, 'day');

function dayTitle(date, format) {
  if (isToday(date)) return 'Heute';
  if (dayjs().add(1, 'day').isSame(date, 'day')) return 'Morgen';
  return dayjs(date).format(format);
}
</script>
