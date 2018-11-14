<template>
  <v-app :dark="isDark">
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
      <spluseins-error-snackbar />
      <no-ssr>
        <!-- no ssr: show/hide depends on client's local storage settings -->
        <spluseins-cookie-snackbar />
      </no-ssr>
    </v-content>
    <spluseins-footer/>
  </v-app>
</template>

<script>
import { mapState } from 'vuex';

import SpluseinsHeader from '../components/spluseins-header.vue';
import SpluseinsCalendar from '../components/spluseins-calendar.vue';
import SpluseinsFooter from '../components/spluseins-footer.vue';
import SpluseinsErrorSnackbar from '../components/spluseins-error-snackbar.vue';
import SpluseinsCookieSnackbar from '../components/spluseins-cookie-snackbar.vue';

export default {
  name: 'HomePage',
  components: {
    SpluseinsHeader,
    SpluseinsCalendar,
    SpluseinsFooter,
    SpluseinsErrorSnackbar,
    SpluseinsCookieSnackbar,
  },
  computed: {
    ...mapState({
      schedule: state => state.splus.schedule,
      isDark: state => state.theme.isDark,
    }),
  },
  async fetch({ store, params, query }) {
    const scheduleId = params.schedule;

    if (!!scheduleId) {
      if (!!query.v) {
        store.dispatch('splus/importCustomSchedule', { params, query });
      } else {
        const schedule =  store.state.splus.schedules
          .find((schedule) => schedule.id == scheduleId);
        store.commit('splus/setSchedule', schedule);
      }

      // exclude static build
      // because loaded schedule depends on the current timestamp
      if (!process.static) {
        await store.dispatch('splus/load');
      }
    }
  },
};
</script>


<style scoped lang="scss">

.container {
  padding: 16px 16px 25px 16px;
}

</style>

