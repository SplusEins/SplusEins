import { createRouter, createWebHistory } from 'vue-router';
import IndexPage from './pages/index.vue';

const routes = [
  { path: '/', component: IndexPage, meta: { title: 'Startseite' } },
  {
    // name and parameter are stored in the browser of users (favorites), do not rename
    name: 'plan-timetable',
    path: '/plan/:timetable?',
    component: () => import('./pages/timetable.vue'),
  },
  {
    path: '/mensa',
    component: () => import('./pages/mensa.vue'),
    meta: { title: 'Mensaplan' },
  },
  {
    path: '/bus',
    component: () => import('./pages/bus.vue'),
    meta: { title: 'Busplan' },
  },
  {
    path: '/impressum',
    component: () => import('./pages/impressum.vue'),
    meta: { title: 'Impressum' },
  },
  {
    path: '/datenschutz',
    component: () => import('./pages/datenschutz.vue'),
    meta: { title: 'Datenschutz' },
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('./pages/not-found.vue'),
    meta: { title: 'Nicht gefunden' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export function setPageTitle(title) {
  document.title = title ? `${title} - SplusEins` : 'SplusEins';
}

router.afterEach((to) => setPageTitle(to.meta.title));

export default router;
