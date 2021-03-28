<template>
  <v-footer
    dark
    app
  >
    <v-col
      cols=12
      class="pa-0 text-body-2 text-center"
    >
      {{ new Date().getFullYear() }}
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

@media screen and (max-width: 350px) {
  .font-size{
    font-size: 12px;
  }
}

.link{
  color: white;
  text-decoration: none;
}

</style>
