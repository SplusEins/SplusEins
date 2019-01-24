<template lang="html">

  <v-footer
    dark
    class = "no-min-height"
    app>
    <v-layout
      justify-center
      row
      wrap>
      <v-flex
        lighten-2
        py-3
        text-xs-center
        xs12
        class="font-size">
        2019 
        —
        <strong> 
          SplusEins
        </strong>
        — 
        <spluseins-about/>
        — 
        <nuxt-link 
          to="/impressum"
          class="link">
          Impressum
        </nuxt-link>
        — 
        <nuxt-link 
          to="/datenschutz"
          class="link">
          Datenschutz
        </nuxt-link>
      </v-flex>
    </v-layout>
  </v-footer>

</template>

<script lang="js">
import SpluseinsAbout from './spluseins-about.vue'

export default  {
  name: 'SplusEinsFooter',
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
