<template lang="html">

  <v-list>

    <v-subheader>
      Favoriten
    </v-subheader>

    <v-list-tile
      @click="favoriteTimetableDialogOpen = true">
      <favorite-timetable-dialog v-model="favoriteTimetableDialogOpen" />
      <v-list-tile-action>
        <v-icon>add</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-title>Favoriten hinzufügen</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>

    <v-list-tile
      v-for="schedule in favoriteSchedules"
      :to="scheduleToRoute(schedule)"
      :key="schedule.id"
      nuxt>
      <v-list-tile-content>
        <v-list-tile-title>{{ schedule.label }}</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>
  
  </v-list>

</template>

<script lang="js">
  import { mapState } from 'vuex';
  import FavoriteTimetableDialog from "./favorite-timetable-dialog.vue";
  
  export default  {
    name: 'FavoriteTimetablesList',
    components: {
      FavoriteTimetableDialog,
    },
    data() {
      return {
        favoriteTimetableDialogOpen: false,
      };
    },
    computed: {
      ...mapState({
        favoriteSchedules: (state) => state.splus.favoriteSchedules,
      }),
    },
    mounted() {

    },
    methods: {
      scheduleToRoute(schedule) {
        return {
          name: 'schedule',
          params: { schedule: schedule.id },
        };
      },
    }
}
</script>

<style scoped lang="scss">
  .favorite-timetable-component {

  }
</style>
