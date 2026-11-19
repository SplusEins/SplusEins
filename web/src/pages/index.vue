<template>
  <v-container fluid max-width="1200">
    <v-row density="compact">
      <v-col cols="12" lg="7">
        <upcoming-lectures-card />
      </v-col>

      <v-col v-show="displayMensaCard || newsCount > 0" cols="12" lg="5">
        <v-row density="compact">
          <v-col v-show="displayMensaCard" cols="12">
            <mensa-card />
          </v-col>
          <v-col v-show="newsCount > 0" cols="12">
            <news-card @loaded="newsCount = $event" />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useMensaStore } from '../stores/mensa';
import UpcomingLecturesCard from '../components/upcoming-lectures-card.vue';
import MensaCard from '../components/mensa-card.vue';
import NewsCard from '../components/news-card.vue';

const mensa = useMensaStore();
const newsCount = ref(0);

const displayMensaCard = computed(() => mensa.nextPlanDay !== undefined);
</script>
