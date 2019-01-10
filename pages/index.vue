<template>
  <v-container
    fluid
    grid-list-md>
    <v-layout
      row
      wrap>
      <v-flex
        xs12
        md6
        lg4
        d-flex>
        <last-changes-card />
      </v-flex>

      <v-flex
        v-if="false"
        xs12
        md6
        lg4
        d-flex>
        <news-card />
      </v-flex>

      <v-flex
        xs12
        md6
        lg4
        d-flex>
        <upcoming-lectures-card />
      </v-flex>

      <v-flex
        v-if="displayQuickAcessCard"
        xs12
        md6
        lg4
        d-flex>
        <quick-access-card />
      </v-flex>
      
      <v-flex
        v-if="mensaIsOpen"
        xs12
        md6
        lg4
        d-flex>
        <mensa-card />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import * as moment from 'moment';
import UpcomingLecturesCard from '../components/upcoming-lectures-card.vue';
import LastChangesCard from '../components/last-changes-card.vue';
import QuickAccessCard from '../components/quick-access-card.vue';
import MensaCard from '../components/mensa-card.vue';
import NewsCard from '../components/news-card.vue';

export default {
  name: 'IndexPage',
  components: {
    UpcomingLecturesCard,
    LastChangesCard,
    QuickAccessCard,
    MensaCard,
    NewsCard,
  },
  async fetch({ store, params }) {
    if (process.static) {
      store.commit('enableLazyLoad');
    }

    if (process.client || !store.state.lazyLoad) {
      await store.dispatch('mensa/loadWeek');
    } else {
      console.log('lazy loading is enabled: not fetching mensa plan and timetable');
    }
  },
  head() {
    return {
      title: 'Startseite',
    };
  },
  computed: {
    mensaIsOpen() {
      if (this.weekPlan.length == 0) {
        return false;
      }

      return this.weekPlan[0].date == parseInt(moment().format('YYYYMMDD'));
    },
    ...mapState({
      weekPlan: (state) => state.mensa.weekPlan,
      favorites: (state) => state.splus.favoriteSchedules,
    }),
    ...mapGetters({
      customSchedulesAsRoutes: 'splus/customSchedulesAsRoutes',
    }),
    displayQuickAcessCard() {
      return this.favorites.length != 0 || this.customSchedulesAsRoutes.length != 0;
    }
  },
};
</script>

<style scoped lang="scss">

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

