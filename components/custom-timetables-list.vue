<template lang="html">

  <v-list subheader>

    <v-subheader class="subheader-block">
      Personalisierte Pläne
    </v-subheader>

    <v-list-tile
      v-for="route in customSchedulesAsRoutes"
      :key="route.query.name"
      :to="route"
      exact
      nuxt>
      <v-list-tile-content
        @click="$track('Menu', 'custom plan used')">
        <v-list-tile-title>{{ route.query.name }}</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>

  </v-list>

</template>

<script lang="js">
import { mapGetters } from 'vuex';

export default {
  name: 'CustomTimetablesList',
  computed: {
    ...mapGetters({
      customSchedulesAsRoutes: 'splus/customSchedulesAsRoutes',
    }),
  },
};
</script>
