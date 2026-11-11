<template>
  <v-card class="fill-height" border>
    <v-card-title class="text-title-large">
      {{ getDayHeader(plan) }}
    </v-card-title>
    <v-divider />
    <v-card-text class="py-1">
      <div v-for="item in plan.meals" :key="item.id" class="py-2">
        <div class="d-flex">
          <div class="text-title-medium">
            {{ item.lane }}
          </div>
          <v-icon
            v-for="icon in getIcons(item)"
            :key="icon.text"
            v-tooltip:bottom="icon.text"
            :icon="icon.icon"
            :color="icon.color"
            :aria-label="icon.text"
            class="icon ml-1 align-self-center"
            size="small"
          />
        </div>
        <div>
          {{ item.name }}
        </div>
        <div class="text-body-small text-medium-emphasis">
          Studenten: {{ getPriceLabel(item.price.student) }} - Angestellte:
          {{ getPriceLabel(item.price.employee) }}
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import {
  mdiSprout,
  mdiCurrencyEur,
  mdiPig,
  mdiCarrot,
  mdiAlertDecagramOutline,
  mdiNewBox,
  mdiCow,
  mdiInformationBoxOutline,
  mdiTurkey,
  mdiHomeSiloOutline,
  mdiFish,
  mdiSheep,
  mdiEarth,
} from '@mdi/js';
import dayjs from '../lib/dayjs';

defineProps({
  /* meals of one day */
  plan: {
    type: Object,
    default: () => ({}),
  },
});

/* icon and color for the categories of a meal, others get an info icon */
const CATEGORY_ICONS = {
  Schwein: { icon: mdiPig },
  Rind: { icon: mdiCow },
  Geflügel: { icon: mdiTurkey },
  Fisch: { icon: mdiFish },
  Lamm: { icon: mdiSheep },
  'Artgerechte Tierhaltung': { icon: mdiHomeSiloOutline },
  Aktion: { icon: mdiAlertDecagramOutline, color: 'purple' },
  'NEU bei uns': { icon: mdiNewBox, color: 'blue' },
  Vegan: { icon: mdiSprout, color: 'green' },
  Vegetarisch: { icon: mdiCarrot, color: 'orange' },
  StudiDeal: { icon: mdiCurrencyEur, color: 'red' },
  Klimaessen: { icon: mdiEarth, color: 'blue' },
};

function getDayHeader(dayPlan) {
  const day = dayjs(dayPlan.date.toString());
  return (
    (day.isSame(dayjs(), 'day') ? 'Heute' : day.format('dddd')) +
    ' - ' +
    day.format('DD.MM.YYYY')
  );
}

function getPriceLabel(price) {
  const euros = Math.floor(price);
  let cents = Math.round((price - euros) * 100);
  cents = cents >= 10 ? cents : '0' + cents;
  return euros + ',' + cents + '€';
}

function getIcons(item) {
  return item.categories.map((category) => ({
    icon: mdiInformationBoxOutline,
    ...CATEGORY_ICONS[category],
    text: category,
  }));
}
</script>

<style scoped>
.icon {
  opacity: 0.7;
}
</style>
