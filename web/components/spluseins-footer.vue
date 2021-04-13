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
      <nuxt-link
        to="/about"
        class="link"
      >
        Über
      </nuxt-link>
      —
      <nuxt-link
        to="/impressum"
        class="link"
      >
        Impressum
      </nuxt-link>
      —
      <nuxt-link
        to="/datenschutz"
        class="link"
      >
        Datenschutz
      </nuxt-link>
    </v-col>
  </v-footer>
</template>

<script>

export default {
  name: 'SplusEinsFooter'
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
