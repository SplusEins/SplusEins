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
            <v-chip
              v-for="department in item.departments?.length
                ? item.departments
                : section.fallbackDepartments"
              :key="department"
              :title="department"
              size="x-small"
              label
              class="mr-1"
            >
              {{ departmentLabel(department) }}
            </v-chip>
            {{ dayjs(item.date).format('DD.MM.') }} · {{ item.text }}
          </div>
        </div>
      </template>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import dayjs from '../lib/dayjs';
import { apiGet } from '../lib/api';
import { departmentLabel, recentNews } from '../lib/news';
import { useSplusStore } from '../stores/splus';

/* emits the number of shown news, so that the page can hide the card */
const emit = defineEmits(['loaded']);

const splus = useSplusStore();

const ostfaliaNews = ref([]);
const campus38News = ref([]);

const sections = computed(() =>
  [
    {
      title: '',
      /* general news name no department on the Ostfalia website */
      fallbackDepartments: ['Ostfalia'],
      items: recentNews(
        ostfaliaNews.value,
        5,
        splus.savedFaculties.map((name) => `Fakultät ${name}`),
      ),
    },
    { title: 'Campus38 Magazin', items: recentNews(campus38News.value, 3) },
  ].filter(({ items }) => items.length > 0),
);

async function loadNews(selector) {
  try {
    return await apiGet(`/api/news/${selector}`);
  } catch (error) {
    console.error('error during News API call', error.message);
    return [];
  }
}

onMounted(async () => {
  [ostfaliaNews.value, campus38News.value] = await Promise.all([
    loadNews('campus'),
    loadNews('campus38'),
  ]);
  emit(
    'loaded',
    sections.value.reduce((count, { items }) => count + items.length, 0),
  );
});
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
