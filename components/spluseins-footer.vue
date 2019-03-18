<template>
  <v-footer
    dark
    class="no-min-height"
    app
  >
    <v-layout
      justify-center
      row
      wrap
    >
      <v-flex
        lighten-2
        py-3
        text-xs-center
        xs12
        class="font-size"
      >
        2019
        —
        <strong>
          SplusEins
        </strong>
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
    <spluseins-about v-model="aboutDialogOpen" />
  </v-footer>
</template>

<script>
import SpluseinsAbout from './spluseins-about.vue'

export default  {
  name: 'SplusEinsFooter',
  data() {
    return {
      aboutDialogOpen: false,
    };
  },
  components: {
    SpluseinsAbout,
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

.no-min-height{
  min-height: unset;
}
</style>
