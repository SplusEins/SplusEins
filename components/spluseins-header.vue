<template lang="html">
  <div>
    <v-toolbar
      :clipped-left="true"
      dark
      fixed
      app>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"/>
      <v-spacer />
      <img
        src="../assets/img/headerLogo.png"
        height="35px"
      >
      <v-toolbar-title 
        class="header-text cursor-pointer"
        @click="trackMatomoEvent('Menu', 'goToHomepage', 'toolbar title')"
      >
        <nuxt-link
          tag="span"
          to="/"
        >SPLUSEINS</nuxt-link>
      </v-toolbar-title>
      <v-spacer />
      <v-toolbar-items>
        <v-btn
          v-show="isOffline"
          color="warning"
          icon
          flat
          @click="setError('Keine Internetverbindung')">
          <v-icon>wifi_off</v-icon>
        </v-btn>
        <v-btn
          icon
          flat
          @click="toggleDark(); trackMatomoEvent('Menu', 'setDark', isDark)">
          <v-icon v-if="isDark">brightness_2</v-icon>
          <v-icon v-else>wb_sunny</v-icon>
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <spluseins-side-nav :drawer.sync="drawer"/>
  </div>
</template>

<script lang="js">
import SpluseinsSideNav from './spluseins-side-nav';
import { mapMutations, mapState } from 'vuex';

export default {
  name: 'SpluseinsHeader',
  components: {SpluseinsSideNav},
  data () {
    return {
      drawer: false,
      isOffline: false,
      offlineNoticeOpen: false,
    };
  },
  computed: {
    ...mapState({
      isDark: state => state.theme.isDark,
    }),
  },
  mounted() {
    window.addEventListener('offline', () => this.isOffline = true);
    window.addEventListener('online', () => this.isOffline = false);
  },
  methods: {
    trackMatomoEvent (category, action, name) {
      this.$matomo.trackEvent(category, action, name);
    },
    ...mapMutations({
      toggleDark: 'theme/toggleDark',
      setError: 'splus/setError',
    }),
  },
};
</script>

<style scoped lang="scss">
  @font-face {
    font-family: Schluber;
    src: url(../assets/fonts/Schluber.otf);
  }
  .header-text{
    font-family:Schluber;
    font-size: 170%;
    position: relative;
    transform: translateY(6%);
  }
  .cursor-pointer {
    cursor: pointer;
  }
</style>