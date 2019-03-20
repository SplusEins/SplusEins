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
            v-show="displayMensaCard"
            :d-flex="displayMensaCard"
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

          <v-flex 
            v-if="displayStatsCard"
            d-flex>
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
            v-show="displayCampusNewsCard"
            :d-flex="displayCampusNewsCard"
            xs12
            md4
            lg12>
            <campus-news-card />
          </v-flex>
          <v-flex
            v-show="displayFacultyNewsCard"
            :d-flex="displayFacultyNewsCard"
            xs12
            md4
            lg6
          >
            <faculty-news-card />
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
import CampusNewsCard from '../components/campus-news-card.vue';
import FacultyNewsCard from '../components/faculty-news-card.vue';
import StatsCard from '../components/stats-card.vue';

export default {
  name: 'IndexPage',
  components: {
    UpcomingLecturesCard,
    LastChangesCard,
    QuickAccessCard,
    MensaCard,
    CampusNewsCard,
    FacultyNewsCard,
    StatsCard,
  },
  computed: {
    displayMensaCard() {
      if (this.weekPlan.length == 0) {
        return false;
      }
      // display if next plan is from today or from tomorrow
      return this.weekPlan[0].date == parseInt(moment().format('YYYYMMDD')) || this.weekPlan[0].date == parseInt(moment().add(1, 'days').format('YYYYMMDD'));;
    },
    displayCampusNewsCard() {
      return this.campusNews.length > 0;
    },
    displayFacultyNewsCard() {
      return Object.keys(this.facultyNews).length > 0;
    },
    displayStatsCard() {
      return this.upcomingLectures.length != 0;
    },
    ...mapState({
      weekPlan: (state) => state.mensa.weekPlan,
      favorites: (state) => state.splus.favoriteSchedules,
      campusNews: (state) => state.news.campusNews,
      facultyNews: (state) => state.news.facultyNews,
      upcomingLectures: (state) => state.splus.upcomingLectures,
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
      await store.dispatch('news/loadCampusNews');
      await store.dispatch('news/loadFacultyNews');
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
