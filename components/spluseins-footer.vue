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
        2018 — 
        <strong> 
          SplusEins
        </strong>
        — 
        <spluseins-about/>
        — 
        <span
          class="link"
          @click="openImpressum()">
          Impressum
        </span>
        — 
        <span
          class="link"
          @click="openDataPrivacy()">
          Datenschutz
        </span>
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
    },
    data() {
      return {
      }
    },
    computed: {

  },
  mounted() {
  },
  methods: {
    openImpressum() {
      this.$router.replace('/impressum');
    },
    openDataPrivacy() {
      this.$router.replace('/datenschutz');
    }
  }
}
</script>

<style scoped lang="scss">

.link{
  cursor: pointer;
}

@media screen and (max-width: 350px) {
  .font-size{
    font-size: 12px;
  }
}

.no-min-height{
  min-height: unset;
}
</style>
