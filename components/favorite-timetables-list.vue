<template>
  <v-list subheader>
    <v-subheader>
      Favoriten
    </v-subheader>
    <v-list-tile
      v-for="schedule in favoriteSchedules"
      :key="schedule.id"
      :to="schedule.route"
      nuxt
    >
      <v-list-tile-content @click="$track('Calendar', 'sideMenu plan used', 'favorite')">
        <v-list-tile-title>{{ schedule.description }}</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>
  </v-list>
</template>

<script>
import { mapState } from 'vuex';

export default  {
  name: 'FavoriteTimetablesList',
  computed: {
    ...mapState({
      favoriteSchedules: (state) => state.splus.favoriteSchedules,
    }),
  },
};
</script>
