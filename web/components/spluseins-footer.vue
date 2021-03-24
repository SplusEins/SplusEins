<template>
  <v-footer
    dark
    app
    class="text-body-2"
  >
    <v-layout
      justify-center
      wrap
    >
      <v-flex
        lighten-2
        text-center
        xs12
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
      </v-flex>
    </v-layout>
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
