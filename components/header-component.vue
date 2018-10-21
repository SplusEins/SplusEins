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
    <SidenavComponent :drawer = "drawer"/>
  </div>
</template>

<script lang="js">
import SidenavComponent from './side-nav-component'

export default {
  name: 'HeaderComponent',
  components: {SidenavComponent},
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
