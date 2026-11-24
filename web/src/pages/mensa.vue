<template>
  <v-container fluid>
    <v-tabs
      :model-value="mensa.selectedPlan?.key"
      show-arrows
      @update:model-value="mensa.setLocation"
    >
      <v-tab v-for="plan in mensa.plans" :key="plan.key" :value="plan.key">
        {{ plan.name }}
      </v-tab>
    </v-tabs>

    <div class="d-flex flex-wrap align-center ga-4 my-4">
      <v-btn-toggle
        v-model="mensa.diet"
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
          :prepend-icon="mensa.diet === option.value ? mdiCheck : undefined"
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

    <v-row v-else>
      <v-col
        v-for="dayPlan in dayPlans"
        :key="dayPlan.date"
        cols="12"
        md="6"
        xl="4"
      >
        <v-card border rounded="lg" class="fill-height">
          <v-card-title
            :class="{ 'text-primary': relativeDay(dayPlan.date) === 'Heute' }"
          >
            {{
              relativeDay(dayPlan.date) ?? dayjs(dayPlan.date).format('dddd')
            }}
            <span class="text-body-medium text-medium-emphasis">
              {{ dayjs(dayPlan.date).format('DD.MM.') }}
            </span>
          </v-card-title>
          <v-divider />
          <mensa-dayplan :plan="dayPlan" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { mdiCheck } from '@mdi/js';
import dayjs from '../lib/dayjs';
import { relativeDay } from '../lib/mensa';
import { useMensaStore } from '../stores/mensa';
import MensaDayplan from '../components/mensa-dayplan.vue';

const DIETS = [
  { value: 'all', title: 'Alle' },
  { value: 'vegetarian', title: 'Vegetarisch' },
  { value: 'vegan', title: 'Vegan' },
];

const mensa = useMensaStore();

onMounted(() => mensa.load());

const dayPlans = computed(() => mensa.selectedPlan?.dayPlans ?? []);
</script>
