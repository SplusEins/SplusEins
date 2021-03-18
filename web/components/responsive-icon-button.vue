<template>
  <v-tooltip
    :disabled="breakpoint"
    bottom
  >
    <template #activator>
      <v-btn
        :outlined="breakpoint"
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
    </template>
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
