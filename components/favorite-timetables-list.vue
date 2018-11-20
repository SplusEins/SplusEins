<template lang="html">

  <v-list>

    <v-subheader>
      Favoriten
      <v-btn
        icon
        flat
        @click="favoriteTimetableDialogOpen = true">
        <v-icon>menu</v-icon>
      </v-btn>
    </v-subheader>
    
    <favorite-timetable-dialog v-model="favoriteTimetableDialogOpen" />
  
    <v-list-tile
      v-for="schedule in favoriteSchedules"
      :key="schedule.id"
      :to="scheduleToRoute(schedule)"
      nuxt>
      <v-list-tile-content>
        {{ shortenDegree(schedule) }} {{ schedule.label }} - {{ schedule.semester }}. Sem.
      </v-list-tile-content>
    </v-list-tile>
  
  </v-list>

</template>

<script lang="js">
  import { mapState } from 'vuex';
  import FavoriteTimetableDialog from './favorite-timetable-dialog.vue';
  import { shortenScheduleDegree } from '../store/splus';
  
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
    methods: {
      scheduleToRoute(schedule) {
        return {
          name: 'schedule',
          params: { schedule: schedule.id },
        };
      },
      shortenDegree(schedule) {
        return shortenScheduleDegree(schedule);
      },
    }
}
</script>