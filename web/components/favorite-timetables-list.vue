<template>
  <v-list subheader>
    <v-subheader>
      Favoriten
    </v-subheader>
    <v-list-item
      v-for="schedule in favoriteSchedules"
      :key="schedule.id"
      :to="schedule.route"
      nuxt
    >
      <v-list-item-content @click="$track('Calendar', 'sideMenu plan used', 'favorite')">
        <v-list-item-title>{{ schedule.description }}</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'FavoriteTimetablesList',
  computed: {
    ...mapState({
      favoriteSchedules: (state) => state.splus.favoriteSchedules
    })
  }
};
</script>
