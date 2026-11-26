<template>
  <v-card
    border
    flat
    rounded="lg"
    :style="isToday ? 'border-color: rgb(var(--v-theme-primary))' : undefined"
  >
    <div class="d-flex align-baseline ga-2 px-4 pt-3 pb-2">
      <span class="text-title-medium" :class="{ 'text-primary': isToday }">
        {{ dayName ?? day.format('dddd') }}
      </span>
      <span class="text-body-small text-medium-emphasis">
        {{ day.format('DD.MM.') }}
      </span>
    </div>
    <v-divider />
    <div
      v-if="meals.length === 0"
      class="px-4 py-2 text-body-medium text-medium-emphasis"
    >
      Keine passenden Gerichte.
    </div>
    <template v-for="(meal, idx) in meals" :key="idx">
      <v-divider v-if="idx > 0 && !meals[idx - 1].side" />
      <div
        v-if="meal.side && !meals[idx - 1]?.side"
        class="px-4 pt-2 text-label-medium text-medium-emphasis"
        :style="SIDE_STYLE"
      >
        Gemüse und Beilagen
      </div>
      <div
        class="px-4"
        :class="
          meal.side
            ? [
                'd-flex py-1 align-baseline ga-3 flex-md-column align-md-stretch ga-md-0',
                { 'pb-3': idx === meals.length - 1 },
              ]
            : 'py-2'
        "
        :style="meal.side ? SIDE_STYLE : undefined"
      >
        <div
          class="d-flex flex-wrap align-center ga-1"
          :class="{ 'flex-grow-1': meal.side }"
        >
          <span class="mr-1" :class="meal.labelClass">
            {{ meal.label }}
          </span>
          <template v-for="category in meal.icons" :key="category">
            <v-icon
              v-tooltip:bottom="category"
              :icon="CATEGORY_ICONS[category].icon"
              :color="CATEGORY_ICONS[category].color"
              :class="{
                'text-medium-emphasis': !CATEGORY_ICONS[category].color,
              }"
              :size="meal.side ? 'x-small' : 'small'"
            />
            <span class="d-sr-only">{{ category }}</span>
          </template>
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
        <template v-if="!meal.side">
          <div
            class="text-body-large font-weight-medium"
            style="hyphens: auto; hyphenate-limit-chars: 12 5 5"
          >
            {{ meal.title }}
          </div>
          <div v-if="meal.sides" class="text-body-small text-medium-emphasis">
            {{ meal.sides }}
          </div>
        </template>
        <div class="d-flex align-baseline ga-2 text-no-wrap">
          <span
            class="font-weight-bold"
            :class="meal.side ? 'text-body-medium' : 'text-body-large'"
          >
            <span class="d-sr-only">Studis</span>
            {{ meal.student }}
          </span>
          <span class="text-body-small text-medium-emphasis">
            {{ meal.employee }}
            <span :class="{ 'd-sr-only': meal.side }">Angestellte</span>
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
import { relativeDay } from '../lib/util';
import { useNow } from '../lib/now';
import {
  DIET_ICONS,
  isSide,
  matchesDiet,
  sortMeals,
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

const SIDE_STYLE = 'background: rgba(var(--v-theme-on-surface), 0.03)';

const mensa = useMensaStore();

const day = computed(() => dayjs(props.plan.date));
const now = useNow();
const dayName = computed(() => relativeDay(day.value, now.value));
const isToday = computed(() => dayName.value === 'Heute');

const EURO = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
});

function labelClass(lane) {
  if (isSide(lane)) return 'text-body-medium';
  return [
    'text-label-medium',
    lane === 'Aktion' ? 'text-primary' : 'text-medium-emphasis',
  ];
}

const meals = computed(() =>
  sortMeals(
    props.plan.meals.filter((meal) => matchesDiet(mensa.diet, meal.categories)),
  ).map((meal) => {
    const { title, sides } = splitMealName(meal.name);
    const side = isSide(meal.lane);
    return {
      title,
      sides,
      side,
      label: side ? `${title} ${sides}`.trim() : meal.lane,
      labelClass: labelClass(meal.lane),
      icons: meal.categories.filter((c) => CATEGORY_ICONS[c]),
      chips: meal.categories.filter(
        (c) =>
          !CATEGORY_ICONS[c] &&
          !HIDDEN_CATEGORIES.includes(c) &&
          c !== meal.lane,
      ),
      student: EURO.format(meal.price.student),
      employee: EURO.format(meal.price.employee),
    };
  }),
);
</script>
