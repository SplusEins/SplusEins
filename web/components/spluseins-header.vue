<template>
  <div>
    <v-app-bar clipped-left dark fixed app>
      <v-app-bar-nav-icon @click.stop="toggleSidenav()" />
      <v-spacer />
      <img src="../assets/img/headerLogo.png" height="35px" class="pr-4" />
      <v-toolbar-title
        class="cursor-pointer"
        :class="showPlanTitle ? 'text-center min-width-0' : 'header-text'"
      >
        <a v-if="staging" :href="commitUrl"> STAGING </a>
        <nuxt-link v-else tag="span" to="/">
          {{ showPlanTitle ? planTitle : 'SPLUSEINS' }}
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
        <v-btn icon text @click="toggleDark(true)">
          <v-icon>{{ mdiThemeLightDark }}</v-icon>
        </v-btn>
      </v-toolbar-items>
    </v-app-bar>
    <spluseins-side-nav />
  </div>
</template>

<script>
import SpluseinsSideNav from './spluseins-side-nav';
import { mapMutations, mapState, mapGetters } from 'vuex';
import { mdiWifiOff, mdiThemeLightDark } from '@mdi/js';

export default {
  name: 'SpluseinsHeader',
  components: { SpluseinsSideNav },
  data() {
    return {
      isOffline: false,
      offlineNoticeOpen: false,
      mdiWifiOff,
      mdiThemeLightDark,
      staging: process.env.staging,
      version: process.env.version,
    };
  },
  computed: {
    commitUrl: function () {
      return 'https://github.com/SplusEins/SplusEins/commit/' + this.version;
    },
    showPlanTitle() {
      return this.$route.name === 'plan-timetable' && !!this.planTitle;
    },
    planTitle() {
      return this.scheduleDisplayName(40);
    },
    ...mapState({
      isDark: (state) => state.ui.isDark,
    }),
    ...mapGetters({
      scheduleDisplayName: 'splus/scheduleDisplayName',
    }),
  },
  watch: {
    isDark: function () {
      this.$vuetify.theme.dark = this.isDark;
    },
  },
  mounted() {
    window.addEventListener('offline', () => {
      this.isOffline = true;
    });
    window.addEventListener('online', () => {
      this.isOffline = false;
    });
  },
  methods: {
    ...mapMutations({
      toggleDark: 'ui/toggleDark',
      toggleSidenav: 'ui/toggleSidenav',
      enqueueError: 'enqueueError',
    }),
  },
};
</script>

<style scoped lang="scss">
@font-face {
  font-family: Schluber;
  src: url(../assets/fonts/Schluber.otf);
}
.header-text {
  font-family: Schluber;
  font-size: 150%;
  position: relative;
  transform: translateY(13%);
}
.cursor-pointer {
  cursor: pointer;
}
.min-width-0 {
  min-width: 0;
}
</style>
