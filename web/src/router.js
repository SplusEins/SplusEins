import { createRouter, createWebHistory } from 'vue-router';
import IndexPage from './pages/index.vue';

const routes = [
  { path: '/', component: IndexPage, meta: { title: 'Startseite' } },
  {
    // e.g. /plan/se3,wpf:a.b?name=Mein%20Plan, see lib/plans.ts
    name: 'plan',
    path: '/plan/:sources?',
    component: () => import('./pages/timetable.vue'),
  },
  {
    path: '/plaene',
    component: () => import('./pages/plans.vue'),
    meta: { title: 'Pläne' },
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
