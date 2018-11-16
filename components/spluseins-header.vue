<template lang="html">
  <div>
    <v-toolbar
      :clipped-left= "true"
      color="black" 
      dark 
      fixed 
      app>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"/>
      <img 
        src="../assets/img/mainLogo.png" 
        width="50px"
      >
      <v-toolbar-title>          
        spluseins</v-toolbar-title>
    </v-toolbar>
    <spluseins-side-nav :drawer = "drawer"/>
  </div>
</template>

<script lang="js">
import SpluseinsSideNav from './spluseins-side-nav'

export default {
  name: 'SpluseinsHeader',
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
