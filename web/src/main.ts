import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { registerSW } from 'virtual:pwa-register';

import './assets/style/roboto.css';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';
import { persistStores } from './stores/persist';

const pinia = createPinia();
// load the user's timetables and settings before anything is displayed
persistStores(pinia);

// service worker for offline support, configured in vite.config.js
registerSW({
  immediate: true,
  // the browser only looks for a new version on page loads, so also check
  // when the user comes back or moves on
  onRegisteredSW(swUrl, registration) {
    if (!registration) return;
    let lastCheck = Date.now();
    const check = () => {
      if (Date.now() - lastCheck < 60 * 1000 || !navigator.onLine) return;
      lastCheck = Date.now();
      registration.update().catch(() => {});
    };
    setInterval(check, 60 * 60 * 1000);
    router.afterEach(check);
    document.addEventListener(
      'visibilitychange',
      () => document.visibilityState === 'visible' && check(),
    );
  },
});

createApp(App).use(pinia).use(router).use(vuetify).mount('#app');
