<template lang="html">
  <div>
    <v-toolbar
      :clipped-left="true"
      dark
      fixed 
      app>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"/>
      <v-flex class="text-xs-center">
        <v-layout 
          align-start 
          justify-center 
          fill-height
          row> 
          <img 
            src="../assets/img/mainLogo.png" 
            height="35px"
          >
          <v-toolbar-title class="header-text">SPLUSEINS</v-toolbar-title>
        </v-layout>
      </v-flex>
      <v-btn 
        icon
        flat
        @click="toggleDark()">
        <v-icon v-if="isDark">brightness_2</v-icon>
        <v-icon v-else>wb_sunny</v-icon>
      </v-btn>
    </v-toolbar>
    <spluseins-side-nav :drawer.sync="drawer"/>
  </div>
</template>

<script lang="js">
import SpluseinsSideNav from './spluseins-side-nav'
import { mapMutations, mapState } from 'vuex';

export default {
  name: 'SpluseinsHeader',
  components: {SpluseinsSideNav},
  data () {
    return {
      drawer: false
    }
  },
  computed: {
    ...mapState({
      isDark: state => state.theme.isDark,
    }),
  },
  methods: {
    ...mapMutations({
      toggleDark: 'theme/toggleDark',
    }),
  },
}
</script>

<style scoped lang="scss">
  @font-face {
    font-family: Schluber;
    src: url(../assets/fonts/Schluber.otf);
  }
  .header-text{
    font-family:Schluber; 
    font-size:170%; 
    position: relative;
    transform: translateY(10%);  
  }
  .header-component {

  }
</style>
