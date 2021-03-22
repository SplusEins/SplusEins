<template>
  <div>
    <v-app-bar
      clipped-left
      dark
      fixed
      app
    >
      <v-app-bar-nav-icon @click.stop="toggleSidenav()" />
      <v-spacer />
      <img
        src="../assets/img/headerLogo.png"
        height="35px"
        class="pr-4"
      >
      <v-toolbar-title
        class="header-text cursor-pointer"
        @click="$track('Menu', 'toDashboard', 'toolbar title')"
      >
        <nuxt-link
          tag="span"
          to="/"
        >
          SPLUSEINS
        </nuxt-link>
      </v-toolbar-title>
      <v-spacer />
      <v-toolbar-items>
        <v-btn
          v-show="isOffline"
          color="warning"
          icon
          text
          @click="enqueueError('Internetverbindung: Nicht verfügbar')"
        >
          <v-icon>{{ mdiWifiOff }}</v-icon>
        </v-btn>
        <v-btn
          icon
          text
          @click="toggleDark(allCookiesAccepted); $track('Menu', 'toggleDark', 'isDark: ' + isDark)"
        >
          <v-icon>{{ mdiThemeLightDark }}</v-icon>
        </v-btn>
      </v-toolbar-items>
    </v-app-bar>
    <spluseins-side-nav />
  </div>
</template>

<script>
import SpluseinsSideNav from './spluseins-side-nav';
import { mapMutations, mapState } from 'vuex';
import { mdiWifiOff, mdiThemeLightDark } from '@mdi/js'

export default {
  name: 'SpluseinsHeader',
  components: { SpluseinsSideNav },
  data () {
    return {
      isOffline: false,
      offlineNoticeOpen: false,
      mdiWifiOff,
      mdiThemeLightDark
    };
  },
  computed: {
    ...mapState({
      isDark: state => state.ui.isDark,
      allCookiesAccepted: state => state.privacy.allowAllCookies
    })
  },
  watch: {
    isDark: function () {
      if (this.isDark === true) {
        return (this.$vuetify.theme.dark = true);
      } else {
        return (this.$vuetify.theme.dark = false);
      }
    }
  },
  mounted () {
    window.addEventListener('offline', () => { this.isOffline = true });
    window.addEventListener('online', () => { this.isOffline = false });
  },
  methods: {
    ...mapMutations({
      toggleDark: 'ui/toggleDark',
      toggleSidenav: 'ui/toggleSidenav',
      enqueueError: 'enqueueError'
    })
  }
};
</script>

<style scoped lang="scss">
  @font-face {
    font-family: Schluber;
    src: url(../assets/fonts/Schluber.otf);
  }
  .header-text{
    font-family:Schluber;
    font-size: 150%;
    position: relative;
    transform: translateY(13%);
  }
  .cursor-pointer {
    cursor: pointer;
  }
</style>
