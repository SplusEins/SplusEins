<template>
  <v-app>
    <spluseins-header/>
    <v-content fill-height>
      <v-container
        fluid
        fill-height>
        <spluseins-calendar v-if="!!schedule" />

        <v-layout
          v-else
          row
          align-center
          justify-center>
          <v-flex
            class="text-xs-center"
            xs12>
            <v-icon>settings</v-icon>
            <p>Leer. Wähle einen Plan aus dem Menü aus.</p>
          </v-flex>
        </v-layout>
      </v-container>
      <spluseins-snackbar />
    </v-content>
    <spluseins-footer/>
  </v-app>
</template>

<script>
import { mapState } from 'vuex';

import SpluseinsHeader from '../components/spluseins-header.vue';
import SpluseinsCalendar from '../components/spluseins-calendar.vue';
import SpluseinsFooter from '../components/spluseins-footer.vue';
import SpluseinsSnackbar from '../components/spluseins-snackbar.vue';

export default {
  name: 'HomePage',
  components: {
    SpluseinsHeader,
    SpluseinsCalendar,
    SpluseinsFooter,
    SpluseinsSnackbar,
  },
  computed: {
    ...mapState({
      schedule: state => state.splus.schedule,
    }),
  },
  async fetch({ store }) {
    if (!process.static && !!store.state.splus.schedule) {
      // not for static build because it depends on the current timestamp
      await store.dispatch('splus/load');
    }
  },
};
</script>
