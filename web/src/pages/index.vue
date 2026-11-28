<template>
  <v-container>
    <v-row density="compact">
      <v-col cols="12" lg="7">
        <upcoming-lectures-card />
      </v-col>

      <v-col v-show="displayMensaCard || newsCount > 0" cols="12" lg="5">
        <v-row density="compact">
          <v-col v-show="displayMensaCard" cols="12">
            <v-card v-if="mensa.plans === null">
              <v-skeleton-loader type="heading, list-item-two-line@2" />
            </v-card>
            <mensa-card v-else />
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
import { computed, onMounted, ref } from 'vue';
import { useMensaStore } from '../stores/mensa';
import UpcomingLecturesCard from '../components/upcoming-lectures-card.vue';
import MensaCard from '../components/mensa-card.vue';
import NewsCard from '../components/news-card.vue';

const mensa = useMensaStore();
const newsCount = ref(0);

const displayMensaCard = computed(
  () => mensa.plans === null || mensa.nextPlanDay !== undefined,
);
onMounted(() => mensa.load());
</script>
