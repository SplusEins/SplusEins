<template>
  <div class="text-body-small text-medium-emphasis text-center pa-3">
    {{ new Date().getFullYear() }} ·
    <span class="font-weight-bold">SplusEins</span> ·
    <a class="link" href="#" @click.prevent="ui.aboutIsOpen = true">Über</a>
    ·
    <router-link to="/impressum" class="link">Impressum</router-link>
    ·
    <router-link to="/datenschutz" class="link">Datenschutz</router-link>
  </div>
</template>

<script setup>
import { useUiStore } from '../stores/ui';

const ui = useUiStore();
</script>
