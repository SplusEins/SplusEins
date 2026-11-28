<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <div class="text-wrap mr-1">
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
    <v-card-text class="pb-0">
      <div class="text-body-large font-weight-semibold">
        {{ mensa.nextPlanDay }}
      </div>
      <template v-if="mensaMenus.length > 0">
        <div v-for="(item, idx) in mensaMenus" :key="idx" class="py-2">
          <div class="text-body-small text-medium-emphasis">
            {{ item.lane }}
          </div>
          <div>{{ item.name }}</div>
        </div>
      </template>
      <empty-hint v-else :icon="mdiFoodOffOutline" class="py-2">
        Kein Menü verfügbar.
      </empty-hint>
    </v-card-text>
    <v-card-actions>
      <v-btn
        to="/mensa"
        :append-icon="mdiChevronRight"
        variant="tonal"
        color="primary"
      >
        Speiseplan
      </v-btn>
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
import { computed, ref } from 'vue';
import { mdiChevronRight, mdiFoodOffOutline, mdiMenuDown } from '@mdi/js';
import { useMensaStore } from '../stores/mensa';
import SelectDialog from './select-dialog.vue';
import EmptyHint from './empty-hint.vue';

const mensa = useMensaStore();
const dialogOpen = ref(false);

const mensaMenus = computed(() =>
  mensa.getNextAvailablePlan.meals.filter((meal) =>
    meal.lane.startsWith('Essen '),
  ),
);
</script>
