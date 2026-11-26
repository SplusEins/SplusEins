<template>
  <div>
    <div class="px-4 py-2">
      <v-text-field
        v-model="query"
        :prepend-inner-icon="mdiMagnify"
        placeholder="Plan suchen"
        aria-label="Plan suchen"
        density="comfortable"
        clearable
        hide-details
      />
    </div>

    <v-list v-if="query?.trim()">
      <timetable-list-item
        v-for="timetable in hits"
        :key="timetable.id"
        :timetable="timetable"
        subtitle
      />
      <div
        v-if="hits.length === 0"
        class="px-4 text-body-medium text-medium-emphasis"
      >
        Kein Plan gefunden. Fehlt deiner, hilft
        <a
          href="https://stundenplan.ostfalia.de/"
          target="_blank"
          rel="noopener"
        >
          stundenplan.ostfalia.de</a
        >.
      </div>
    </v-list>
    <!-- shown while nothing is searched -->
    <slot v-else />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { mdiMagnify } from '@mdi/js';
import { useSplusStore } from '../stores/splus';
import TimetableListItem from './timetable-list-item.vue';

/* v-model: the search input */
const query = defineModel({ type: String, default: '' });

const splus = useSplusStore();

const hits = computed(() => splus.searchTimetables(query.value ?? ''));
</script>
