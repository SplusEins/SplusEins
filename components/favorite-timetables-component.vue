<template lang="html">

  <v-list-group>
    <v-list-tile slot="activator">
      <v-list-tile-action>
        <v-icon>favorite</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-title>Meine Favoriten</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>

    <v-list-tile>
      <v-list-tile-content>
        <v-list-tile-title>Erster Favorit</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>
    <v-list-tile>
      <v-list-tile-content>
        <v-list-tile-title>Zweiter Favorit</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>
  </v-list-group>    

</template>

<script lang="js">
  export default  {
    name: 'FavoriteTimetablesComponent',
    data() {
      return {

      }
    },
    computed: {

    },
    mounted() {

    },
    methods: {

    }
}
</script>

<style scoped lang="scss">
  .favorite-timetable-component {

  }
</style>
