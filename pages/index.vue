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
      wrap
    >
      <v-flex
        d-flex
        md6
        lg6
        order-xs1
        order-md1
      >
        <v-layout column>
          <v-flex
            d-flex
          >
            <upcoming-lectures-card />
          </v-flex>
          <v-flex
            d-flex
          >
            <faculty-news-card v-show="$vuetify.breakpoint.mdAndUp" />
          </v-flex>
        </v-layout>
      </v-flex>

      <v-flex
        d-flex
        md6
        lg6
        order-xs5
        order-md2
      >
        <campus-news-card />
      </v-flex>

      <v-flex
        d-flex
        order-xs6
        order-md7
      >
        <faculty-news-card v-show="!$vuetify.breakpoint.mdAndUp" />
      </v-flex>

      <v-flex
        v-show="displayMensaCard"
        :d-flex="displayMensaCard"
        md6
        :lg4="hasSubscribableTimetables"
        :lg6="!hasSubscribableTimetables"
        order-xs2
        order-md3
      >
        <mensa-card />
      </v-flex>

      <v-flex
        v-show="hasSubscribableTimetables"
        :d-flex="hasSubscribableTimetables"
        md6
        lg4
        order-xs4
        order-md4
      >
        <stats-card />
      </v-flex>

      <v-flex
        v-show="hasSubscribableTimetables"
        :d-flex="hasSubscribableTimetables"
        md6
        lg4
        order-xs3
        order-md5
      >
        <quick-access-card />
      </v-flex>

      <v-flex
        d-flex
        :md6="displayMensaCard"
        :lg4="!displayMensaCard && hasSubscribableTimetables"
        :lg6="displayMensaCard && !hasSubscribableTimetables"
        :lg12="displayMensaCard && hasSubscribableTimetables"
        order-xs7
        order-md6
      >
        <last-changes-card />
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
      return moment().isSame(this.weekPlan[0].date, 'day') || moment().add(1, 'days').isSame(this.weekPlan[0].date, 'day');
    },
    displayCampusNewsCard() {
      return this.campusNews.length > 0;
    },
    displayFacultyNewsCard() {
      return Object.keys(this.facultyNews).length > 0;
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
      meta: [
        { hid: 'description', name: 'description', content: 'Startseite' },
        { hid: 'og:description', property: 'og:description', content: 'Startseite' },
      ],
    };
  },
  methods: {
    ...mapMutations({
      setSidenav: 'ui/setSidenav',
    }),
  },
  middleware: 'cached',
};
</script>
