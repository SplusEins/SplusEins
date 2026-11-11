import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { registerSW } from 'virtual:pwa-register';
import Donut from 'vue-css-donut-chart';
import 'vue-css-donut-chart/dist/vcdonut.css';

import './assets/style/roboto.css';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';
import { persistStores } from './stores/persist';

const pinia = createPinia();
// load the user's timetables and settings before anything is displayed
persistStores(pinia);

// service worker for offline support, configured in vite.config.js
registerSW({ immediate: true });

createApp(App).use(pinia).use(router).use(vuetify).use(Donut).mount('#app');
