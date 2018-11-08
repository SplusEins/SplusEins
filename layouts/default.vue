<template>
  <v-app :dark="isDark">
    <nuxt />
  </v-app>
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState({
      isDark: state => state.theme.isDark,
    }),
  },
}
</script>
