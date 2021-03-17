<template>
  <v-tooltip
    :disabled="breakpoint"
    bottom
  >
    <v-btn
      slot="activator"
      :outline="breakpoint"
      :icon="!breakpoint"
      :text="!breakpoint"
      @click="$emit('click')"
    >
      <v-icon :left="breakpoint">
        {{ icon }}
      </v-icon>
      <span v-show="breakpoint">
        {{ text }}
      </span>
    </v-btn>
    <span>{{ text }}</span>
  </v-tooltip>
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
