<template>
  <v-app-bar
    theme="dark"
    color="secondary"
    :height="$vuetify.display.mobile ? 56 : 64"
  >
    <v-app-bar-nav-icon @click.stop="toggleSidenav()" />
    <div class="header-title">
      <img
        src="../assets/img/headerLogo.png"
        height="35"
        class="bg-white rounded-lg pa-1 mr-4"
      />
      <a v-if="staging" :href="commitUrl"> STAGING </a>
      <router-link
        v-else
        to="/"
        class="text-truncate"
        :class="showPlanTitle ? 'text-title-large' : 'header-text'"
      >
        {{ showPlanTitle ? planTitle : 'SPLUSEINS' }}
      </router-link>
    </div>
    <v-btn
      v-show="isOffline"
      color="warning"
      :icon="mdiWifiOff"
      aria-label="Offline"
      @click="enqueueError('Internetverbindung: Nicht verfügbar')"
    />
    <v-btn
      :icon="mdiThemeLightDark"
      aria-label="Dunkles Design umschalten"
      @click="toggleDark()"
    />
    <v-progress-linear
      :active="pendingRequests > 0"
      indeterminate
      absolute
      location="bottom"
      color="primary"
    />
  </v-app-bar>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { mdiWifiOff, mdiThemeLightDark } from '@mdi/js';
import { useAppStore } from '../stores/app';
import { useUiStore } from '../stores/ui';
import { useSplusStore } from '../stores/splus';
import { pendingRequests } from '../lib/api';
import { staging, version } from '../lib/config';

const route = useRoute();
const splus = useSplusStore();
const { toggleDark, toggleSidenav } = useUiStore();
const { enqueueError } = useAppStore();

const commitUrl = 'https://github.com/SplusEins/SplusEins/commit/' + version;

const planTitle = computed(() => splus.scheduleDisplayName(40));
const showPlanTitle = computed(
  () => route.name === 'plan-timetable' && !!planTitle.value,
);

const isOffline = ref(!navigator.onLine);
window.addEventListener('offline', () => {
  isOffline.value = true;
});
window.addEventListener('online', () => {
  isOffline.value = false;
});
</script>

<style scoped>
@font-face {
  font-family: Schluber;
  src: url(../assets/fonts/Schluber.otf);
}
.header-title {
  /* use the space between the buttons and center the content */
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.header-title a {
  color: inherit;
  text-decoration: none;
}
.header-text {
  font-family: Schluber;
  font-size: 24px;
  transform: translateY(13%);
}
</style>
