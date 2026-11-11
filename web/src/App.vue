<template>
  <v-app>
    <spluseins-header />
    <!-- the footer comes before the navigation so that it uses the full width -->
    <spluseins-footer />
    <spluseins-side-nav />
    <v-main>
      <!-- the key re-creates the page when e.g. another timetable is opened -->
      <router-view :key="$route.fullPath" />
      <spluseins-error-snackbar />
    </v-main>
    <spluseins-disclaimer />
  </v-app>
</template>

<script setup>
import { watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useTheme } from 'vuetify';
import { useUiStore } from './stores/ui';
import SpluseinsHeader from './components/spluseins-header.vue';
import SpluseinsSideNav from './components/spluseins-side-nav.vue';
import SpluseinsFooter from './components/spluseins-footer.vue';
import SpluseinsErrorSnackbar from './components/spluseins-error-snackbar.vue';
import SpluseinsDisclaimer from './components/spluseins-disclaimer.vue';

const { isDark } = storeToRefs(useUiStore());
const theme = useTheme();

watch(isDark, () => theme.change(isDark.value ? 'dark' : 'light'), {
  immediate: true,
});
</script>

<style>
/* long titles continue on the next line instead of being cut off */
.v-card-title {
  white-space: normal;
}
/* text links use the color of the theme, also in dark mode */
:where(a:not(.v-btn, .v-list-item, .v-tab)) {
  color: rgb(var(--v-theme-primary));
}
a.link {
  text-decoration: none;
}
</style>
