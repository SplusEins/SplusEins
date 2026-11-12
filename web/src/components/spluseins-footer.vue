<template>
  <div class="text-body-small text-medium-emphasis text-center pa-3">
    {{ new Date().getFullYear() }} ·
    <span class="font-weight-bold">SplusEins</span> ·
    <a class="link" href="#" @click.prevent="aboutDialogOpen = true">Über</a>
    ·
    <router-link to="/impressum" class="link">Impressum</router-link>
    ·
    <router-link to="/datenschutz" class="link">Datenschutz</router-link>
    <spluseins-about v-model="aboutDialogOpen" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import SpluseinsAbout from './spluseins-about.vue';

const aboutDialogOpen = ref(false);
</script>
