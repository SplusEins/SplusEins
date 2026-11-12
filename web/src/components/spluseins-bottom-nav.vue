<template>
  <v-bottom-navigation
    v-if="$vuetify.display.mobile"
    :model-value="activeTab"
    grow
    color="primary"
  >
    <v-btn value="start" to="/">
      <v-icon :icon="mdiHome" />
      <span>Start</span>
    </v-btn>
    <v-btn value="plan" to="/plaene">
      <v-icon :icon="mdiCalendar" />
      <span>Pläne</span>
    </v-btn>
    <v-btn value="mensa" to="/mensa">
      <v-icon :icon="mdiFoodForkDrink" />
      <span>Mensa</span>
    </v-btn>
    <v-btn value="bus" to="/bus">
      <v-icon :icon="mdiBus" />
      <span>Bus</span>
    </v-btn>
  </v-bottom-navigation>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { mdiHome, mdiCalendar, mdiFoodForkDrink, mdiBus } from '@mdi/js';

const route = useRoute();

// null instead of undefined keeps the selection controlled by the route
const activeTab = computed(() => {
  const path = route.path;
  if (path === '/') return 'start';
  if (path === '/plaene' || path.startsWith('/plan/')) return 'plan';
  if (path === '/mensa') return 'mensa';
  if (path === '/bus') return 'bus';
  return null;
});
</script>
