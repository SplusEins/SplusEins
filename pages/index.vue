<template>
  <v-app>
    <spluseins-header/>
    <v-content fill-height>
      <spluseins-calendar/>
    </v-content>
    <spluseins-footer/>
  </v-app>
</template>

<script>
import SpluseinsHeader from '../components/spluseins-header.vue'
import SpluseinsCalendar from '../components/spluseins-calendar.vue'
import SpluseinsFooter from '../components/spluseins-footer.vue'

export default {
  name: 'HomePage',
  layout: 'empty',
  components: {
    SpluseinsHeader,
    SpluseinsCalendar,
    SpluseinsFooter
  },
  data() {
    return {
    }
  },
  computed: {
  },
  methods: {
  }
}
</script>

<style lang="scss">
</style>
