<template>
  <div class="d-flex align-center ga-3 text-body-medium text-medium-emphasis">
    <v-icon :icon="icon" size="20" />
    <div><slot /></div>
  </div>
</template>

<script setup>
defineProps({ icon: { type: String, required: true } });
</script>
