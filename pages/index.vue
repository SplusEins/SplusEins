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
      <!-- Breakpoint xs and sm -->
      <v-layout 
        v-show="$vuetify.breakpoint.xs || $vuetify.breakpoint.sm"
        row
        wrap
      >
        <v-flex
          xs12
          sm12 
          d-flex
        >
          <upcoming-lectures-card />
        </v-flex>

        <v-flex
          v-show="mensaIsOpen" 
          :d-flex="mensaIsOpen"
          xs12
          sm12
        >
          <mensa-card />
        </v-flex>

        <v-flex
          v-show="hasSubscribableTimetables" 
          :d-flex="hasSubscribableTimetables"
          xs12
          sm12
        >
          <quick-access-card />
        </v-flex>

        <v-flex
          v-show="displayStatsCard" 
          :d-flex="displayStatsCard"
          xs12
          sm12
        >
          <stats-card />
        </v-flex>
  
        <v-flex
          v-show="displayCampusNewsCard" 
          :d-flex="displayCampusNewsCard"
          xs12
          sm12
        >
          <campus-news-card />
        </v-flex>

        <v-flex
          v-show="displayFacultyNewsCard" 
          :d-flex="displayFacultyNewsCard"
          xs12
          sm12
        >
          <faculty-news-card />
        </v-flex>
  
        <v-flex 
          d-flex
          xs12
          sm12
        >
          <last-changes-card />
        </v-flex>
      </v-layout>
      
      <!-- Breakpoint md and display everyting -->
      <v-layout 
        v-show="displayStatsCard && mensaIsOpen && $vuetify.breakpoint.md"
        row
        wrap
      >
        <v-flex
          md6 
          d-flex
        >
          <upcoming-lectures-card />
        </v-flex>
        <v-flex
          md6  
          d-flex
        >
          <quick-access-card />
        </v-flex>
        <v-flex
          md6 
          d-flex
        >
          <mensa-card />
        </v-flex>
        <v-flex
          md6 
          d-flex
        >
          <stats-card />
        </v-flex>
        <v-flex 
          d-flex
          md6
        >
          <campus-news-card />
        </v-flex>
        <v-flex 
          d-flex
          md6
        >
          <v-layout column>
            <v-flex
              d-flex
            >
              <faculty-news-card />
            </v-flex>
            <v-flex
              d-flex
            >
              <last-changes-card />
            </v-flex>
          </v-layout>
        </v-flex>
      </v-layout>

      <!-- Breakpoint md but has no subscribable timetables -->
      <v-layout 
        v-show="!displayStatsCard && mensaIsOpen && $vuetify.breakpoint.md"
        row
        wrap
      >   
        <v-flex
          md6 
          d-flex
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
              <mensa-card />
            </v-flex>
          </v-layout>
        </v-flex>

        <v-flex 
          d-flex
          md6
        >
          <v-layout column>
            <v-flex
              d-flex
            >
              <faculty-news-card />
            </v-flex>
            <v-flex
              d-flex
            >
              <last-changes-card />
            </v-flex>
          </v-layout>
        </v-flex>

        <v-flex
          d-flex
          md12
        >
          <campus-news-card />
        </v-flex>
      </v-layout>

      <!-- Breakpoint mdAndUp but no mensa -->
      <v-layout 
        v-show="displayStatsCard && !mensaIsOpen && $vuetify.breakpoint.mdAndUp"
        row
        wrap
      >
        <v-flex 
          d-flex
          lg6
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
              <faculty-news-card />
            </v-flex>
          </v-layout>
        </v-flex>

        <v-flex
          lg6 
          d-flex
        >
          <campus-news-card />
        </v-flex>

        <v-flex
          lg4
          d-flex
        >
          <last-changes-card />
        </v-flex>

        <v-flex
          lg4 
          d-flex
        >
          <stats-card />
        </v-flex>

        <v-flex
          lg4 
          d-flex
        >
          <quick-access-card />
        </v-flex>
      </v-layout>

      <!-- Breakpoint mdAndUp no mensa and no subscribable timetables -->
      <v-layout 
        v-show="!displayStatsCard && !mensaIsOpen && $vuetify.breakpoint.mdAndUp"
        row
        wrap
      >
        <v-flex
          md6 
          d-flex
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
              <campus-news-card />
            </v-flex>
          </v-layout>
        </v-flex>

        <v-flex 
          d-flex
          md6
        >
          <v-layout column>
            <v-flex
              d-flex
            >
              <faculty-news-card />
            </v-flex>
            <v-flex
              d-flex
            >
              <last-changes-card />
            </v-flex>
          </v-layout>
        </v-flex>
      </v-layout>

      <!-- Breakpoint lgAndUp display everything -->
      <v-layout 
        v-show="displayStatsCard && mensaIsOpen && $vuetify.breakpoint.lgAndUp"
        row
        wrap
      >
        <v-flex 
          d-flex
          lg6
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
              <faculty-news-card />
            </v-flex>
          </v-layout>
        </v-flex>

        <v-flex
          lg3
          d-flex
        >
          <mensa-card />
        </v-flex>

        <v-flex
          lg3
          d-flex
        >
          <last-changes-card />
        </v-flex>

        <v-flex
          lg3 
          d-flex
        >
          <stats-card />
        </v-flex>

        <v-flex
          lg6 
          d-flex
        >
          <campus-news-card />
        </v-flex>

        <v-flex
          lg3 
          d-flex
        >
          <quick-access-card />
        </v-flex>
      </v-layout>

      <!-- Breakpoint lgAndUp but has no subscribable timetables -->
      <v-layout 
        v-show="!displayStatsCard && mensaIsOpen && $vuetify.breakpoint.lgAndUp"
        row
        wrap
      >
        <v-flex 
          d-flex
          lg6
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
              <faculty-news-card />
            </v-flex>
            <v-flex
              d-flex
            >
              <mensa-card />
            </v-flex>
          </v-layout>
        </v-flex>

        <v-flex 
          d-flex
          lg6
        >
          <v-layout column>
            <v-flex
              d-flex
            >
              <last-changes-card />
            </v-flex>
            <v-flex
              d-flex
            >
              <campus-news-card />
            </v-flex>
          </v-layout>
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
      return this.$store.getters['splus/hasSubscribableTimetables'] && this.upcomingLectures.length != 0;
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
