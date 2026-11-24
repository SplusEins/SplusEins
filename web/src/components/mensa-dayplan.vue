<template>
  <v-card
    border
    flat
    rounded="lg"
    :style="isToday ? 'border-color: rgb(var(--v-theme-primary))' : undefined"
  >
    <div class="d-flex align-baseline ga-2 px-4 pt-3 pb-2">
      <span class="text-title-medium" :class="{ 'text-primary': isToday }">
        {{ relativeDay(plan.date) ?? dayjs(plan.date).format('dddd') }}
      </span>
      <span class="text-body-small text-medium-emphasis">
        {{ dayjs(plan.date).format('DD.MM.') }}
      </span>
    </div>
    <v-divider />
    <div
      v-if="meals.length === 0"
      class="px-4 py-3 text-body-medium text-medium-emphasis"
    >
      Keine passenden Gerichte.
    </div>
    <template v-for="(meal, idx) in meals" :key="idx">
      <v-divider v-if="idx > 0" />
      <div class="px-4 py-3">
        <div class="d-flex flex-wrap align-center ga-1 mb-1">
          <span class="text-label-medium text-medium-emphasis mr-1">
            {{ meal.lane }}
          </span>
          <v-icon
            v-for="category in meal.icons"
            :key="category"
            v-tooltip:bottom="category"
            :icon="CATEGORY_ICONS[category].icon"
            :color="CATEGORY_ICONS[category].color"
            :aria-label="category"
            :class="{ 'text-medium-emphasis': !CATEGORY_ICONS[category].color }"
            size="small"
          />
          <v-chip
            v-for="category in meal.chips"
            :key="category"
            :color="CHIP_COLORS[category]"
            :variant="CHIP_COLORS[category] ? 'tonal' : 'outlined'"
            :class="{ 'text-medium-emphasis': !CHIP_COLORS[category] }"
            size="x-small"
          >
            {{ category }}
          </v-chip>
        </div>
        <div
          class="text-body-large font-weight-medium"
          style="hyphens: auto; hyphenate-limit-chars: 12 5 5"
        >
          {{ meal.title }}
        </div>
        <div v-if="meal.sides" class="text-body-small text-medium-emphasis">
          {{ meal.sides }}
        </div>
        <div class="d-flex flex-wrap align-baseline ga-2 mt-1">
          <span class="text-body-large font-weight-bold">
            <span class="d-sr-only">Studis</span>
            {{ meal.student }}
          </span>
          <span class="text-body-small text-medium-emphasis">
            {{ meal.employee }}
            Angestellte
          </span>
        </div>
      </div>
    </template>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';
import { mdiCow, mdiFish, mdiPig, mdiSheep, mdiTurkey } from '@mdi/js';
import dayjs from '../lib/dayjs';
import { useMensaStore } from '../stores/mensa';
import {
  DIET_ICONS,
  matchesDiet,
  relativeDay,
  splitMealName,
} from '../lib/mensa';

const props = defineProps({
  /* meals of one day */
  plan: {
    type: Object,
    required: true,
  },
});

const CHIP_COLORS = {
  'NEU bei uns': 'primary',
  Aktion: 'primary',
  StudiDeal: 'primary',
};

const CATEGORY_ICONS = {
  ...DIET_ICONS,
  Schwein: { icon: mdiPig },
  Rind: { icon: mdiCow },
  Geflügel: { icon: mdiTurkey },
  Fisch: { icon: mdiFish },
  Lamm: { icon: mdiSheep },
};

const HIDDEN_CATEGORIES = ['Niedersachsen Menü'];

const mensa = useMensaStore();

const isToday = computed(() => relativeDay(props.plan.date) === 'Heute');

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
      icons: meal.categories.filter((c) => CATEGORY_ICONS[c]),
      chips: meal.categories.filter(
        (c) =>
          !CATEGORY_ICONS[c] &&
          !HIDDEN_CATEGORIES.includes(c) &&
          c !== meal.lane,
      ),
      student: EURO.format(meal.price.student),
      employee: EURO.format(meal.price.employee),
    })),
);
</script>
