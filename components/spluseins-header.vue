<template lang="html">
  <div>
    <v-toolbar
      :clipped-left= "true"
      color="black" 
      dark 
      fixed 
      app>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"/>
      <v-toolbar-title>SPLUSEINS</v-toolbar-title>
    </v-toolbar>
    <spluseins-side-nav :drawer = "drawer"/>
  </div>
</template>

<script lang="js">
import SpluseinsSideNav from './spluseins-side-nav'

export default {
  name: 'SplusEinsHeader',
  components: {SpluseinsSideNav},
  data () {
    return {
      drawer: false
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
  .header-component {

  }
</style>
