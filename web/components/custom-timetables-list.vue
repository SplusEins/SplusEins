<template>
  <v-list subheader>
    <v-subheader class="subheader-block">
      Personalisierte Pläne
    </v-subheader>

    <v-list-item
      v-for="route in customSchedulesAsRoutes"
      :key="route.query.name"
      :to="route"
      exact
      nuxt
    >
      <v-list-item-content @click="$track('Calendar', 'plan used', 'custom')">
        <v-list-item-title>{{ route.query.name }}</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
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
