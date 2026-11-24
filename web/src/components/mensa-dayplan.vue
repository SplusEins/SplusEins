<template>
  <div>
    <div
      v-if="meals.length === 0"
      class="px-4 py-3 text-body-medium text-medium-emphasis"
    >
      Keine passenden Gerichte.
    </div>
    <template v-for="(meal, idx) in meals" :key="idx">
      <v-divider v-if="idx > 0" />
      <div class="d-flex ga-3 px-4 py-3">
        <div class="flex-grow-1">
          <div class="d-flex flex-wrap align-center ga-1 mb-1">
            <span
              class="text-label-medium text-uppercase text-medium-emphasis mr-1"
            >
              {{ meal.lane }}
            </span>
            <v-chip
              v-for="category in meal.categories"
              :key="category"
              size="small"
            >
              {{ category }}
            </v-chip>
          </div>
          <div class="text-body-large font-weight-medium">
            {{ meal.title }}
          </div>
          <div v-if="meal.sides" class="text-body-medium text-medium-emphasis">
            {{ meal.sides }}
          </div>
        </div>
        <div class="text-right text-no-wrap pt-5">
          <div class="text-body-large font-weight-bold">
            <span class="d-sr-only">Studis</span>
            {{ meal.student }}
          </div>
          <div class="text-body-small text-medium-emphasis">
            <span class="d-sr-only">Angestellte</span>
            {{ meal.employee }}
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useMensaStore } from '../stores/mensa';
import { matchesDiet, splitMealName } from '../lib/mensa';

const props = defineProps({
  /* meals of one day */
  plan: {
    type: Object,
    required: true,
  },
});

const mensa = useMensaStore();

const EURO = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
});

const meals = computed(() =>
  props.plan.meals
    .filter((meal) => matchesDiet(mensa.diet, meal.categories))
    .map((meal) => ({
      lane: meal.lane,
      ...splitMealName(meal.name),
      categories: meal.categories,
      student: EURO.format(meal.price.student),
      employee: EURO.format(meal.price.employee),
    })),
);
</script>
