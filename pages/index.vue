<template>
  <v-app>
    <spluseins-header/>
    <v-content fill-height>
      <spluseins-calendar />
      <spluseins-snackbar />
    </v-content>
    <spluseins-footer/>
  </v-app>
</template>

<script>
import SpluseinsHeader from '../components/spluseins-header.vue'
import SpluseinsCalendar from '../components/spluseins-calendar.vue'
import SpluseinsFooter from '../components/spluseins-footer.vue'
import SpluseinsSnackbar from '../components/spluseins-snackbar.vue'

export default {
  name: 'HomePage',
  components: {
    SpluseinsHeader,
    SpluseinsCalendar,
    SpluseinsFooter,
    SpluseinsSnackbar,
  },
  async fetch({ store }) {
    if (!process.static) {
      // not for static build because it depends on the current timestamp
      await store.dispatch('splus/load');
    }
  },
}
</script>

<style lang="scss">
</style>
