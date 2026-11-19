<template>
  <v-card>
    <v-card-title class="d-flex align-center pb-0">
      <div class="text-title-large text-wrap mr-1">
        {{ mensa.selectedPlan?.name }}
      </div>
      <v-btn
        v-if="mensa.plans?.length > 1"
        v-tooltip:end="'Mensa auswählen'"
        :icon="mdiMenuDown"
        variant="text"
        density="compact"
        aria-label="Mensa auswählen"
        @click="dialogOpen = true"
      />
    </v-card-title>
    <v-card-subtitle>{{ mensa.nextPlanDay }}</v-card-subtitle>
    <v-card-text class="pt-2 pb-0">
      <template v-if="mensaMenus.length > 0">
        <div v-for="(item, idx) in mensaMenus" :key="idx" class="py-2">
          <div class="text-body-small text-medium-emphasis">
            {{ item.lane }}
          </div>
          <div>{{ item.name }}</div>
        </div>
      </template>
      <div v-else>
        <i>Kein Menü verfügbar.</i>
      </div>
    </v-card-text>
    <v-card-actions class="px-4">
      <v-chip
        to="/mensa"
        :append-icon="mdiChevronRight"
        variant="outlined"
        label
      >
        Speiseplan
      </v-chip>
    </v-card-actions>
    <select-dialog
      v-model:open="dialogOpen"
      :selected="mensa.selectedPlan"
      :items="mensa.plans ?? []"
      :item-title="(plan) => plan.name"
      title="Standort auswählen"
      @update:selected="(plan) => mensa.setLocation(plan.key)"
    />
  </v-card>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { mdiChevronRight, mdiMenuDown } from '@mdi/js';
import { useMensaStore } from '../stores/mensa';
import SelectDialog from './select-dialog.vue';

const mensa = useMensaStore();
const dialogOpen = ref(false);

const mensaMenus = computed(() =>
  mensa.getNextAvailablePlan.meals.filter((meal) =>
    meal.lane.startsWith('Essen '),
  ),
);

onMounted(() => mensa.load());
</script>
