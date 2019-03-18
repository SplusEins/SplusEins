<template>
  <v-container
    v-touch="{
      right: () => setSidenav(true)
    }"
    fluid
    grid-list-md
  >
    <v-layout
      v-if="$vuetify.breakpoint.xs || $vuetify.breakpoint.sm"
      row
      wrap>
      <v-flex 
        d-flex>
        <upcoming-lectures-card />
      </v-flex>
      <v-flex 
        d-flex>
        <mensa-card />
      </v-flex>
      <v-flex 
        d-flex>
        <quick-access-card />
      </v-flex>
      <v-flex 
        d-flex>
        <stats-card />
      </v-flex>
      <v-flex 
        d-flex>
        <campus-news-card />
      </v-flex>
      <v-flex 
        d-flex>
        <faculty-news-card />
      </v-flex>
      <v-flex 
        d-flex>
        <last-changes-card />
      </v-flex>
    </v-layout>

    <!-- md -->
    <v-layout
      v-if="$vuetify.breakpoint.md"
      row
      wrap>
      <v-layout 
        row
        wrap>
        <v-flex
          md6 
          d-flex>
          <upcoming-lectures-card />
        </v-flex>
        <v-flex
          md6  
          d-flex>
          <quick-access-card />
        </v-flex>
      </v-layout>

      <v-layout
        row
        wrap
      >
        <v-flex
          md6 
          d-flex>
          <mensa-card />
        </v-flex>
        <v-flex
          md6 
          d-flex>
          <stats-card />
        </v-flex>
      </v-layout>

      <v-layout
        row
        wrap>
        <v-flex 
          d-flex
          md6>
          <campus-news-card />
        </v-flex>
        <v-flex 
          d-flex
          md6>
          <v-layout column>
            <v-flex
              d-flex
              md6
            >
              <faculty-news-card />
            </v-flex>
            <v-flex
              d-flex
              md6
            >
              <last-changes-card />
            </v-flex>
          </v-layout>
        </v-flex> 
      </v-layout> 
    </v-layout>

    <!-- lg -->
    <v-layout
      v-if="$vuetify.breakpoint.lg || $vuetify.breakpoint.xl"
      row
      wrap>
      <v-layout 
        row
        wrap
      >
        <v-flex 
          d-flex
          lg4>
          <v-layout column>
            <v-flex
              d-flex
              lg6
            >
              <upcoming-lectures-card />
            </v-flex>
            <v-flex
              d-flex
              lg6
            >
              <faculty-news-card />
            </v-flex>
          </v-layout>
        </v-flex>
        <v-flex
          lg4 
          d-flex>
          <campus-news-card />
        </v-flex>
        <v-flex
          lg4 
          d-flex>
          <mensa-card />
        </v-flex>
      </v-layout>

      <v-layout 
        row
        wrap
      >
        <v-flex
          lg4 
          d-flex>
          <stats-card />
        </v-flex>
        <v-flex 
          lg4
          d-flex>
          <quick-access-card />
        </v-flex>
        <v-flex 
          d-flex
          lg4>
          <last-changes-card />
        </v-flex> 
      </v-layout>
 
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
    mensaIsOpen() {
      if (this.weekPlan.length == 0) {
        return false;
      }

      return this.weekPlan[0].date == parseInt(moment().format('YYYYMMDD'));
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
