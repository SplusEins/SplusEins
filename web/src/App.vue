<template>
  <v-app>
    <spluseins-header />
    <spluseins-side-nav v-if="!$vuetify.display.mobile" />
    <v-main>
      <!-- the key re-creates the page when e.g. another timetable is opened -->
      <router-view :key="$route.fullPath" />
      <v-snackbar-queue
        v-model="errorQueue"
        color="error"
        :timeout="-1"
        total-visible="3"
        closable
      />
    </v-main>
    <spluseins-bottom-nav />
    <spluseins-disclaimer />
    <spluseins-about v-model="aboutIsOpen" />
  </v-app>
</template>

<script setup>
import { watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useTheme } from 'vuetify';
import { useUiStore } from './stores/ui';
import { useAppStore } from './stores/app';
import { useSplusStore } from './stores/splus';
import { useMensaStore } from './stores/mensa';
import { useBusStore } from './stores/bus';
import SpluseinsHeader from './components/spluseins-header.vue';
import SpluseinsSideNav from './components/spluseins-side-nav.vue';
import SpluseinsBottomNav from './components/spluseins-bottom-nav.vue';
import SpluseinsDisclaimer from './components/spluseins-disclaimer.vue';
import SpluseinsAbout from './components/spluseins-about.vue';

const { isDark, aboutIsOpen } = storeToRefs(useUiStore());
const { errorQueue } = storeToRefs(useAppStore());

// load again what failed while offline
window.addEventListener('online', () => {
  const splus = useSplusStore();
  const mensa = useMensaStore();
  const bus = useBusStore();
  if (splus.agendaFailed) splus.loadAgendaEvents();
  if (splus.weekFailed) splus.showWeek(splus.week);
  if (mensa.plans?.length === 0) mensa.load();
  if (bus.failed) bus.load();
});
const theme = useTheme();

watch(isDark, () => theme.change(isDark.value ? 'dark' : 'light'), {
  immediate: true,
});
</script>

<style>
/* text links use the color of the theme, also in dark mode */
:where(a:not(.v-btn, .v-list-item, .v-tab, [class*='-emphasis'])) {
  color: rgb(var(--v-theme-primary));
}
</style>
