<template>
  <v-alert
    v-if="splus.unsavedState"
    color="primary"
    variant="tonal"
    :icon="mdiContentSaveAlertOutline"
    class="mb-2"
  >
    <div class="d-flex flex-wrap align-center ga-2">
      <span class="flex-grow-1 font-weight-medium">
        {{
          splus.unsavedState === 'changed'
            ? 'Geändert, aber noch nicht gespeichert'
            : 'Dieser Plan ist nicht gespeichert'
        }}
      </span>
      <v-btn
        v-if="splus.unsavedState === 'changed'"
        variant="text"
        @click="discard()"
      >
        Verwerfen
      </v-btn>
      <v-btn color="primary" variant="flat" @click="save()">Speichern</v-btn>
    </div>
  </v-alert>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { mdiContentSaveAlertOutline } from '@mdi/js';
import { useSplusStore } from '../stores/splus';
import { planKey, planRoute } from '../lib/plans';

const splus = useSplusStore();
const router = useRouter();

function save() {
  splus.savePlan(planKey(splus.schedule), { ...splus.schedule });
}

function discard() {
  router.replace(planRoute(splus.savedSchedule));
}
</script>
