<template lang="html">
  <v-navigation-drawer
    :clipped="true"
    v-model="drawerProp"
    fixed
    app
    width="350">
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
    drawerProp: {
      get() { return this.drawer},
      set(val) { this.$emit('update:drawer', val)}
   }
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
