<template lang="html">

  <v-footer 
    color="black"
    app>
    <v-layout
      justify-center
      row
      wrap>
      <v-flex
        lighten-2
        py-3
        text-xs-center
        white--text
        xs12>
        2018 — 
        <strong> 
          SplusEins
        </strong>
        — 
        <spluseins-about/>
        — 
        <spluseins-impressum/>
      </v-flex>
    </v-layout>
  </v-footer>

</template>

<script lang="js">
import SpluseinsImpressum from './spluseins-impressum.vue'
import SpluseinsAbout from './spluseins-about.vue'
  export default  {
    name: 'SplusEinsFooter',
    components: {SpluseinsImpressum,SpluseinsAbout},
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
</style>
