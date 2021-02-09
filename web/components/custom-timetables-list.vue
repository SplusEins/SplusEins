<template>
  <v-list subheader>
    <v-subheader class="subheader-block">
      Personalisierte Pläne
    </v-subheader>

    <v-list-tile
      v-for="route in customSchedulesAsRoutes"
      :key="route.query.name"
      :to="route"
      exact
      nuxt
    >
      <v-list-tile-content @click="$track('Calendar', 'plan used', 'custom')">
        <v-list-tile-title>{{ route.query.name }}</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>
  </v-list>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'CustomTimetablesList',
  computed: {
    ...mapGetters({
      customSchedulesAsRoutes: 'splus/customTimetablesAsRoutes'
    })
  }
};
</script>
