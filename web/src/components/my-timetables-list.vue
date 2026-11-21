<template>
  <v-list lines="two">
    <v-list-subheader>Deine Pläne</v-list-subheader>
    <v-list-item
      v-for="plan in splus.plans"
      :key="planKey(plan)"
      :to="planRoute(plan)"
      :active="$route.name === 'plan' && splus.savedSchedule === plan"
      :subtitle="planSubtitle(plan)"
    >
      <template #title>
        <span class="text-wrap">{{ title(plan) }}</span>
      </template>
      <template v-if="!plan.name" #append>
        <v-btn
          :icon="mdiHeart"
          color="primary"
          :aria-label="`${planDisplayName(plan)} merken`"
          aria-pressed="true"
          variant="text"
          size="small"
          @click.prevent.stop="splus.deletePlan(planKey(plan))"
        />
      </template>
    </v-list-item>
    <slot />
  </v-list>
</template>

<script setup>
import { mdiHeart } from '@mdi/js';
import { useSplusStore } from '../stores/splus';
import {
  planDisplayName,
  planKey,
  planRoute,
  planSubtitle,
} from '../lib/plans';

const splus = useSplusStore();

/* the semester of a timetable is in the subtitle */
const title = (plan) =>
  plan.name ??
  splus.getTimetableById(plan.sources[0].id)?.label ??
  plan.sources[0].id;
</script>
