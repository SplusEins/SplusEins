<template lang="html">

  <v-list subheader>

    <v-subheader>
      Favoriten
    </v-subheader>
      
    <v-list-tile
      v-for="timetable in favoriteTimetables"
      :to="timetableToRoute(timetable)"
      :key="timetable.id"
      nuxt>
      <v-list-tile-content>
        <v-list-tile-title>{{ timetable.degreeShort }} {{ timetable.label }} - {{ timetable.semester }}. Sem.</v-list-tile-title>
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
        favoriteTimetables: (state) => state.splus.favoriteTimetables,
      }),
    },
    methods: {
      timetableToRoute(timetable) {
        return {
          name: 'timetable',
          params: { timetable: timetable.id },
        };
      },
    }
}
</script>