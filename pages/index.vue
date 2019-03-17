<template>
  <v-container
    v-touch="{
      right: () => setSidenav(true)
    }"
    fluid
    grid-list-md
  >
    <v-layout
      row
      wrap>

      <v-flex
        xs12
        :md6="hasSubscribableTimetables"
        :md12="!hasSubscribableTimetables"
        lg3
        d-flex
      >
        <v-layout column>
          <v-flex d-flex>
            <upcoming-lectures-card />
          </v-flex>

          <v-flex
            v-show="mensaIsOpen"
            :d-flex="mensaIsOpen"
          >
            <mensa-card />
          </v-flex>
        </v-layout>
      </v-flex>

      <v-flex
        v-if="hasSubscribableTimetables"
        xs12
        md6
        lg3
        d-flex
      >
        <v-layout column>
          <v-flex d-flex>
            <quick-access-card />
          </v-flex>

          <v-flex d-flex>
            <stats-card />
          </v-flex>
        </v-layout>
      </v-flex>

      <v-flex
        xs12
        md12
        :lg6="hasSubscribableTimetables"
        :lg9="!hasSubscribableTimetables"
        d-flex
      >
        <v-layout
          row
          wrap
        >
          <v-flex
            v-show="displayGeneralNewsCard"
            :d-flex="displayGeneralNewsCard"
            xs12
            md4
            lg12>
            <general-news-card />
          </v-flex>
          <v-flex
            v-show="displaySpecificNewsCard"
            :d-flex="displaySpecificNewsCard"
            xs12
            md4
            lg6
          >
            <specific-news-card />
          </v-flex>
          <v-flex
            d-flex
            xs12
            md4
            lg6
          >
            <last-changes-card />
          </v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex';
import * as moment from 'moment';
import UpcomingLecturesCard from '../components/upcoming-lectures-card.vue';
import LastChangesCard from '../components/last-changes-card.vue';
import QuickAccessCard from '../components/quick-access-card.vue';
import MensaCard from '../components/mensa-card.vue';
import GeneralNewsCard from '../components/general-news-card.vue';
import SpecificNewsCard from '../components/specific-news-card.vue';
import StatsCard from '../components/stats-card.vue';

export default {
  name: 'IndexPage',
  components: {
    UpcomingLecturesCard,
    LastChangesCard,
    QuickAccessCard,
    MensaCard,
    GeneralNewsCard,
    SpecificNewsCard,
    StatsCard,
  },
  computed: {
    mensaIsOpen() {
      if (this.weekPlan.length == 0) {
        return false;
      }

      return this.weekPlan[0].date == parseInt(moment().format('YYYYMMDD'));
    },
    displayGeneralNewsCard() {
      return this.generalNews.length > 0;
    },
    displaySpecificNewsCard() {
      return this.specificNews.length > 0;
    },
    ...mapState({
      weekPlan: (state) => state.mensa.weekPlan,
      favorites: (state) => state.splus.favoriteSchedules,
      generalNews: (state) => state.news.generalNews,
      specificNews: (state) => state.news.specificNews,
    }),
    ...mapGetters({
      customSchedulesAsRoutes: 'splus/customSchedulesAsRoutes',
      hasSubscribableTimetables: 'splus/hasSubscribableTimetables',
    }),
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
  methods: {
    ...mapMutations({
      setSidenav: 'ui/setSidenav',
    }),
  }
};
</script>
