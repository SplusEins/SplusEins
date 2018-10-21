<template lang="html">
  <v-list-group>
    <v-list-tile slot="activator">
      <v-list-tile-action>
        <v-icon>home</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-title>Meine Stundenpläne</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>

    <v-list-tile>
      <v-list-tile-content>
        <v-list-tile-title>Eigener Plan 1</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>
    <v-list-tile>
      <v-list-tile-content>
        <v-list-tile-title>Eigener Plan 2</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>
  </v-list-group>    
</template>

<script lang="js">
  export default  {
    name: 'MyTimetablesComponent',
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
  .my-timetables-component {

  }
</style>
