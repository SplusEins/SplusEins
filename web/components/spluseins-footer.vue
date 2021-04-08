<template>
  <v-footer
    dark
    app
    class="px-1 text-body-2 font-size-mobile"
  >
    <v-col
      cols=12
      class="pa-0 text-center"
    >
      {{ new Date().getFullYear() }}
      —
      <span class="font-weight-bold">
        SplusEins
      </span>
      —
      <a
        class="white--text"
        @click="aboutDialogOpen = true; $track('Footer', 'openAbout')"
      >
        Über
      </a>
      —
      <nuxt-link
        to="/impressum"
        class="link"
        @click="$track('Footer', 'openImpressum')"
      >
        Impressum
      </nuxt-link>
      —
      <nuxt-link
        to="/datenschutz"
        class="link"
        @click="$track('Footer', 'openDatenschutz')"
      >
        Datenschutz
      </nuxt-link>
    </v-col>
    <lazy-spluseins-about v-model="aboutDialogOpen" />
  </v-footer>
</template>

<script>

export default {
  name: 'SplusEinsFooter',
  data () {
    return {
      aboutDialogOpen: false
    };
  }
}
</script>

<style scoped lang="scss">

@media screen and (max-width: 380px) {
  .font-size-mobile {
    font-size: 12px !important;
  }
}

.link{
  color: white;
  text-decoration: none;
}

</style>
