<template lang="html">
  <v-navigation-drawer
    :clipped="true"
    v-model="drawer"
    dark 
    fixed
    app
    width = "350">
    <v-list dense>
      <my-timetables-component/>
      <favorite-timetables-component/>
      <all-timetables-component/>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="js">

import AllTimetablesComponent from './all-timetables-component.vue'
import FavoriteTimetablesComponent from './favorite-timetables-component.vue'
import MyTimetablesComponent from './my-timetables-component.vue'

export default {
  name: 'SidenavComponent',
  components: {
    AllTimetablesComponent,
    FavoriteTimetablesComponent,
    MyTimetablesComponent
  },
  props: {
    drawer : {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
    }
  },
  computed: {
  },
  mounted () {

  },
  methods: {
  }
}
</script>

<style scoped lang="scss">
  .side-nav-component {

  }
</style>
