<template>
  <v-card>
    <v-card-title class="text-title-large">Neuigkeiten</v-card-title>
    <v-card-text>
      <template v-for="(section, idx) in sections" :key="section.title">
        <v-divider v-if="idx > 0" class="my-3" />
        <div v-if="section.title" class="text-body-large font-weight-bold">
          {{ section.title }}
        </div>
        <div v-for="item in section.items" :key="item.link" class="py-1">
          <a
            :href="item.link"
            target="_blank"
            rel="noopener"
            class="news-link font-weight-medium"
          >
            {{ item.title }}
          </a>
          <div class="text-medium-emphasis">
            {{ dayjs(item.date).format('DD.MM.') }} · {{ item.text }}
          </div>
        </div>
      </template>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import dayjs from '../lib/dayjs';
import { apiGet } from '../lib/api';
import { ostfaliaNewsPath, recentNews } from '../lib/news';
import { useSplusStore } from '../stores/splus';

/* emits the number of shown news, so that the page can hide the card */
const emit = defineEmits(['loaded']);

const { subscribedFaculty: faculty } = storeToRefs(useSplusStore());

const ostfaliaNews = ref([]);
const campus38News = ref([]);

const sections = computed(() =>
  [
    { title: '', items: ostfaliaNews.value },
    { title: 'Campus38 Magazin', items: campus38News.value },
  ].filter(({ items }) => items.length > 0),
);

async function loadNews(path, count) {
  try {
    return recentNews(await apiGet(`${path}?limit=10`), count);
  } catch (error) {
    console.error('error during News API call', error.message);
    return [];
  }
}

watch(
  faculty,
  async () => {
    [ostfaliaNews.value, campus38News.value] = await Promise.all([
      loadNews(ostfaliaNewsPath(faculty.value), 3),
      loadNews('/api/news/campus38', 2),
    ]);
    emit('loaded', ostfaliaNews.value.length + campus38News.value.length);
  },
  { immediate: true },
);
</script>

<style scoped>
.news-link {
  color: inherit;
  text-decoration: none;
}
.news-link:hover {
  text-decoration: underline;
}
</style>
