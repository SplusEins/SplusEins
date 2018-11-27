<template lang="html">

  <v-list subheader>

    <v-subheader>
      Favoriten
    </v-subheader>
      
    <v-list-tile
      v-for="schedule in favoriteSchedules"
      :to="scheduleToRoute(schedule)"
      :key="schedule.id"
      nuxt>
      <v-list-tile-content
        @click="trackMatomoEvent('Menu','favorite plan used', schedule.degreeShort + ' ' + schedule.label + ' ' + schedule.semester + '. Sem.')">
        <v-list-tile-title>{{ schedule.degreeShort }} {{ schedule.label }} - {{ schedule.semester }}. Sem.</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>
  
  </v-list>

</template>

<script lang="js">
  import { mapState } from 'vuex';
  
  export default  {
    name: 'FavoriteTimetablesList',
    computed: {
      ...mapState({
        favoriteSchedules: (state) => state.splus.favoriteSchedules,
      }),
    },
    methods: {
      trackMatomoEvent(category, action, name) {
        this.$matomo.trackEvent(category, action, name);
      },
      scheduleToRoute(schedule) {
        return {
          name: 'schedule',
          params: { schedule: schedule.id },
        };
      },
    }
}
</script>