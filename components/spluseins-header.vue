<template lang="html">
  <div>
    <v-toolbar
      :clipped-left="true"
      dark
      fixed 
      app>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"/>
      <v-flex class="text-xs-center">
        <v-toolbar-title>  
          <v-layout 
            align-center 
            justify-center 
            row 
            fill-height> 
            <img 
              src="../assets/img/mainLogo.png" 
              height="40px"
            >
          <!-- SPLUSEINS -->
          </v-layout>
        </v-toolbar-title>
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
  .header-component {

  }
</style>
