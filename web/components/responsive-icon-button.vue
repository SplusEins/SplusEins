<template>
  <v-btn
    :outlined="breakpoint"
    :icon="!breakpoint"
    depressed
    rounded
    @click="$emit('click')"
    class="mr-0 mr-md-2"
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
