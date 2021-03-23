<template>
  <v-btn
    :outlined="breakpoint"
    :icon="!breakpoint"
    :text="!breakpoint"
    @click="$emit('click')"
    class="ml-1"
  >
    <v-icon :left="breakpoint">
      {{ icon }}
    </v-icon>
    <span v-show="breakpoint">
      {{ text }}
    </span>
  </v-btn>
</template>

<script>
export default {
  name: 'ResponsiveIconButton',
  props: {
    breakpoint: {
      required: true,
      type: Boolean
    },
    icon: {
      required: true,
      type: String
    },
    text: {
      required: true,
      type: String
    }
  }
};
</script>
