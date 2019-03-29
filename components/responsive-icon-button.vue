<template functional>
  <v-tooltip
    :disabled="props.breakpoint"
    bottom
  >
    <v-btn
      slot="activator"
      :outline="props.breakpoint"
      :icon="!props.breakpoint"
      :flat="!props.breakpoint"
      @click="listeners.click"
    >
      <v-icon :left="props.breakpoint">
        {{ props.icon }}
      </v-icon>
      <span v-show="props.breakpoint">
        {{ props.text }}
      </span>
    </v-btn>
    <span>{{ props.text }}</span>
  </v-tooltip>
</template>

<script>
import { VBtn, VTooltip, VIcon } from 'vuetify/lib';

export default {
  name: 'ResponsiveIconButton',
  components: { VBtn, VTooltip, VIcon },
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
    },
  },
};
</script>
