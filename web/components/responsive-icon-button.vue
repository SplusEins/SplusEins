<template>
  <v-tooltip
    :disabled="breakpoint"
    bottom
  >
    <template #activator="{ on, attrs }">
      <v-btn
        :outlined="breakpoint"
        :icon="!breakpoint"
        depressed
        rounded
        @click="$emit('click')"
        class="mr-0 mr-md-2"
        v-bind="attrs"
        v-on="on"
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

<style lang="scss">
.theme--light.v-btn.v-btn--icon {
  color: inherit !important;
}
</style>
