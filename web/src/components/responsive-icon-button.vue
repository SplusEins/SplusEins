<!-- A button which shows icon and text on big screens and only the icon on small ones -->
<template>
  <v-btn
    v-if="breakpoint"
    variant="outlined"
    rounded="pill"
    class="mr-2"
    :prepend-icon="icon"
    @click="$emit('click')"
  >
    {{ text }}
  </v-btn>
  <v-btn
    v-else
    v-tooltip:bottom="text"
    :icon="icon"
    :aria-label="text"
    @click="$emit('click')"
  />
</template>

<script setup>
defineProps({
  /* true: show icon and text */
  breakpoint: {
    required: true,
    type: Boolean,
  },
  icon: {
    required: true,
    type: String,
  },
  text: {
    required: true,
    type: String,
  },
});
defineEmits(['click']);
</script>
