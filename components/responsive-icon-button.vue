<template functional>
  <v-tooltip
    :disabled="props.breakpoint"
    bottom>
    <v-btn
      slot="activator"
      :outline="props.breakpoint"
      :icon="!props.breakpoint"
      :flat="!props.breakpoint"
      :href="props.href"
      @click="listeners.click">
      <v-icon :left="props.breakpoint">{{ props.icon }}</v-icon>
      <span v-show="props.breakpoint">{{ props.text }}</span>
    </v-btn>
    <span>{{ props.text }}</span>
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
    },
    href: {
      required: false,
      default: undefined,
      type: String
    },
  },
};
</script>
