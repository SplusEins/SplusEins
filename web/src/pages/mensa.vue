<template>
  <v-container max-width="1400">
    <v-menu v-if="mensa.selectedPlan">
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          variant="tonal"
          color="primary"
          rounded="xl"
          size="large"
          class="text-title-large"
          :prepend-icon="mdiMapMarker"
          :append-icon="mdiMenuDown"
        >
          {{ mensa.selectedPlan.name }}
        </v-btn>
      </template>
      <v-list>
        <v-list-item
          v-for="plan in mensa.plans"
          :key="plan.key"
          :title="plan.name"
          :active="plan.key === mensa.selectedPlan.key"
          color="primary"
          @click="mensa.setLocation(plan.key)"
        />
      </v-list>
    </v-menu>

    <p
      v-if="mensa.selectedPlan"
      class="text-body-small text-medium-emphasis mt-3 mb-3"
    >
      Öffnungszeiten und Allergene beim
      <a
        :href="mensa.selectedPlan.url"
        target="_blank"
        class="text-primary font-weight-medium text-decoration-none text-no-wrap"
        >Studierendenwerk<v-icon
          :icon="mdiOpenInNew"
          size="x-small"
          class="ml-1"
      /></a>
    </p>

    <v-btn-toggle
      v-model="mensa.diet"
      mandatory
      divided
      variant="outlined"
      size="small"
      rounded="xl"
      color="primary"
      class="mb-6"
    >
      <v-btn v-for="option in DIETS" :key="option.value" :value="option.value">
        <template v-if="option.icon" #prepend>
          <v-icon
            :icon="option.icon.icon"
            :color="option.icon.color"
            :class="{ 'text-medium-emphasis': !option.icon.color }"
          />
        </template>
        {{ option.title }}
      </v-btn>
    </v-btn-toggle>

    <v-alert v-if="mensa.plans && dayPlans.length === 0" type="info">
      Aktuell sind keine Pläne verfügbar.
    </v-alert>

    <div
      v-else
      class="ga-3"
      :style="`display: grid; align-items: start; grid-template-columns: repeat(${mdAndUp ? DESKTOP_DAYS : 1}, minmax(0, 1fr))`"
    >
      <mensa-dayplan v-for="plan in days" :key="plan.date" :plan="plan" />
    </div>
  </v-container>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useDisplay } from 'vuetify';
import { mdiMapMarker, mdiMenuDown, mdiOpenInNew } from '@mdi/js';
import { DIET_ICONS } from '../lib/mensa';
import { useMensaStore } from '../stores/mensa';
import MensaDayplan from '../components/mensa-dayplan.vue';

const DIETS = [
  { value: 'all', title: 'Alle' },
  { value: 'vegetarian', title: 'Vegetarisch', icon: DIET_ICONS.Vegetarisch },
  { value: 'vegan', title: 'Vegan', icon: DIET_ICONS.Vegan },
];

const DESKTOP_DAYS = 5;

const mensa = useMensaStore();

onMounted(() => mensa.load());

const { mdAndUp } = useDisplay();

const dayPlans = computed(() => mensa.selectedPlan?.dayPlans ?? []);

/* desktop shows the next days in one row */
const days = computed(() =>
  mdAndUp.value ? dayPlans.value.slice(0, DESKTOP_DAYS) : dayPlans.value,
);
</script>
