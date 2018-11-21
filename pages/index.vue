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
          <div class="background-div">
            <img 
              src="../assets/img/calendarLogo.png"
              class="background-image">
          </div>
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
  async fetch({ store }) {
    if (!process.static && !!store.state.splus.schedule) {
      // not for static build because it depends on the current timestamp
      await store.dispatch('splus/load');
    }
  },
};
</script>


<style scoped lang="scss">

.container {
  padding: 16px 16px 25px 16px;
}

.background-div{
  position: absolute;
  opacity: 0.2; 
  filter: alpha(opacity=20);
}

.background-image{
  max-height: 80vh;
  max-width: 80%;
  height: auto;
	margin-left: auto;
	margin-right: auto;
	display: block;
}


</style>

