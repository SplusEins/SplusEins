<template>
  <v-container
    v-touch="{
      right: () => setSidenav(true),
    }"
    fluid
  >
    <v-row density="compact">
      <v-col cols="12" md="6" order="first">
        <v-row no-gutters class="fill-height">
          <v-col cols="12" class="mb-md-1">
            <upcoming-lectures-card />
          </v-col>
        </v-row>
      </v-col>

      <v-col
        v-show="displayMensaCard"
        cols="12"
        md="6"
        :lg="hasSubscribableTimetables ? 4 : 6"
        order="3"
        order-md="4"
      >
        <mensa-card />
      </v-col>

      <v-col
        v-show="hasSubscribableTimetables"
        cols="12"
        md="6"
        :lg="displayMensaCard ? 4 : 6"
        order="5"
      >
        <stats-card />
      </v-col>

      <v-col
        v-show="hasSubscribableTimetables"
        cols="12"
        md="6"
        :lg="displayMensaCard ? 4 : 6"
        order="2"
        order-md="3"
      >
        <quick-access-card />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import dayjs from '../lib/dayjs';
import { useUiStore } from '../stores/ui';
import { useSplusStore } from '../stores/splus';
import { useMensaStore } from '../stores/mensa';
import UpcomingLecturesCard from '../components/upcoming-lectures-card.vue';
import QuickAccessCard from '../components/quick-access-card.vue';
import MensaCard from '../components/mensa-card.vue';
import StatsCard from '../components/stats-card.vue';

const mensa = useMensaStore();
const { setSidenav } = useUiStore();
const { hasSubscribableTimetables } = storeToRefs(useSplusStore());

const displayMensaCard = computed(() => {
  const dayPlans = mensa.plans?.[0]?.dayPlans;
  if (!dayPlans || dayPlans.length === 0) {
    return false;
  }
  // display if next plan is from today or from tomorrow
  return (
    dayjs().isSame(dayPlans[0].date, 'day') ||
    dayjs().add(1, 'days').isSame(dayPlans[0].date, 'day')
  );
});
</script>
