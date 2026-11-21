<template>
  <v-list-item
    :to="picker ? undefined : route"
    :subtitle="subtitle ? timetableSubtitle(timetable) : undefined"
    :disabled="selected"
    @click="picker?.add(timetable)"
  >
    <template #title>
      <span class="text-wrap">{{ timetable.label }}</span>
    </template>
    <template #append>
      <v-btn
        v-if="!picker"
        :icon="isFavorite ? mdiHeart : mdiHeartOutline"
        :color="isFavorite ? 'primary' : undefined"
        :aria-label="`${name} merken`"
        :aria-pressed="isFavorite"
        variant="text"
        size="small"
        @click.prevent.stop="splus.toggleRemembered({ id: timetable.id })"
      />
      <v-icon v-else-if="selected" :icon="mdiCheck" aria-label="Hinzugefügt" />
    </template>
  </v-list-item>
</template>

<script setup>
import { computed, inject } from 'vue';
import { mdiCheck, mdiHeart, mdiHeartOutline } from '@mdi/js';
import { useSplusStore } from '../stores/splus';
import { planRoute } from '../lib/plans';
import { timetableDisplayName, timetableSubtitle } from '../lib/util';

const props = defineProps({
  timetable: {
    type: Object,
    required: true,
  },
  subtitle: {
    type: Boolean,
    default: false,
  },
});

/* provided by the custom timetable dialog: rows add the timetable instead of opening it */
const picker = inject('timetablePicker', undefined);

const splus = useSplusStore();

const selected = computed(
  () => !!picker?.selectedIds.value.includes(props.timetable.id),
);
const isFavorite = computed(() => splus.isRemembered(props.timetable.id));
// the saved plan keeps its identity, so only the item whose plan changed renders again
const saved = computed(() => splus.planByKey(props.timetable.id));
const route = computed(() =>
  planRoute(saved.value ?? { sources: [{ id: props.timetable.id }] }),
);
const name = computed(() => timetableDisplayName(props.timetable));
</script>
