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
        &copy;2018 — <strong>sPlusEins</strong> —       
        <spluseins-impressum/>
      </v-flex>
    </v-layout>
    <spluseins-impressum
      :active="impressumActive"
      class="impressum"
      @close="impressumActive = false"/>
  </v-footer>

</template>

<script lang="js">
import SpluseinsImpressum from './spluseins-impressum.vue'
  export default  {
    name: 'SplusEinsFooter',
    components: {SpluseinsImpressum},
    data() {
      return {
        impressumActive: false
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
  .impressum {
    cursor: pointer;
  }
</style>
