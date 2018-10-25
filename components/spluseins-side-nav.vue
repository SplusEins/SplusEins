<template lang="html">
  <v-navigation-drawer
    :clipped="true"
    v-model="drawer"
    dark 
    fixed
    app
    width="360">
    <custom-timetables-list />
    <v-divider />
    <favorite-timetables-list />
    <v-divider />
    <general-timetables-list />
  </v-navigation-drawer>
</template>

<script lang="js">

import GeneralTimetablesList from './general-timetables-list.vue'
import FavoriteTimetablesList from './favorite-timetables-list.vue'
import CustomTimetablesList from './custom-timetables-list.vue'

export default {
  name: 'SpluseinsSideNav',
  components: {
    GeneralTimetablesList,
    FavoriteTimetablesList,
    CustomTimetablesList
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
