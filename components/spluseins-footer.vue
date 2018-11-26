<template lang="html">

  <v-footer
    dark
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
        <spluseins-impressum/>
        — 
        <spluseins-data-privacy/>
      </v-flex>
    </v-layout>
  </v-footer>

</template>

<script lang="js">
import SpluseinsImpressum from './spluseins-impressum.vue'
import SpluseinsAbout from './spluseins-about.vue'
import SpluseinsDataPrivacy from './spluseins-data-privacy.vue'

  export default  {
    name: 'SplusEinsFooter',
    components: {
      SpluseinsImpressum,
      SpluseinsAbout,
      SpluseinsDataPrivacy
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

  }
}
</script>

<style scoped lang="scss">

@media screen and (max-width: 350px) {
  .font-size{
    font-size: 12px;
  }
}
</style>
