<template>
  <v-footer app theme="dark" class="px-1 text-body-medium font-size-mobile">
    <div class="w-100 text-center">
      {{ new Date().getFullYear() }}
      —
      <span class="font-weight-bold"> SplusEins </span>
      —
      <a class="link" href="#" @click.prevent="aboutDialogOpen = true">
        Über
      </a>
      —
      <router-link to="/impressum" class="link"> Impressum </router-link>
      —
      <router-link to="/datenschutz" class="link"> Datenschutz </router-link>
    </div>
  </v-footer>
  <!-- outside of the footer, otherwise the dialog would always use the dark theme -->
  <spluseins-about v-model="aboutDialogOpen" />
</template>

<script setup>
import { ref } from 'vue';
import SpluseinsAbout from './spluseins-about.vue';

const aboutDialogOpen = ref(false);
</script>

<style scoped>
@media screen and (max-width: 380px) {
  .font-size-mobile {
    font-size: 12px !important;
  }
}

.link {
  color: white;
  text-decoration: none;
}
</style>
