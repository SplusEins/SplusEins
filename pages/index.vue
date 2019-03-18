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

      <!-- Breakpoint xs and sm -->
      <template v-if="$vuetify.breakpoint.xs || $vuetify.breakpoint.sm">
        <v-flex d-flex>
          <upcoming-lectures-card />
        </v-flex>
        <v-flex
          v-if="mensaIsOpen" 
          d-flex>
          <mensa-card />
        </v-flex>
        <v-flex
          v-if="hasSubscribableTimetables" 
          d-flex>
          <quick-access-card />
        </v-flex>
        <v-flex
          v-if="displayStatsCard"  
          d-flex>
          <stats-card />
        </v-flex>
        <v-flex
          v-if="displayCampusNewsCard"  
          d-flex>
          <campus-news-card />
        </v-flex>
        <v-flex
          v-if="displayFacultyNewsCard"  
          d-flex>
          <faculty-news-card />
        </v-flex>
        <v-flex d-flex>
          <last-changes-card />
        </v-flex>
      </template>
      
      <!-- Breakpoint md and display everyting -->
      <template v-if="displayStatsCard && mensaIsOpen && $vuetify.breakpoint.md">
       
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
          wrap>
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
                md6>
                <faculty-news-card />
              </v-flex>
              <v-flex
                d-flex
                md6>
                <last-changes-card />
              </v-flex>
            </v-layout>
          </v-flex>
        </v-layout> 
      </template>
 
      <!-- Breakpoint md but has no subscribable timetables -->
      <template v-if="!displayStatsCard && mensaIsOpen && $vuetify.breakpoint.md">
        
        <v-layout 
          row
          wrap>
          <v-flex
            md6 
            d-flex>
            <v-layout column>
              <v-flex
                d-flex
                md6>
                <upcoming-lectures-card />
              </v-flex>
              <v-flex
                d-flex
                md6>
                <mensa-card />
              </v-flex>
            </v-layout>
          </v-flex>
          <v-flex 
            d-flex
            md6>
            <v-layout column>
              <v-flex
                d-flex
                md6>
                <faculty-news-card />
              </v-flex>
              <v-flex
                d-flex
                md6>
                <last-changes-card />
              </v-flex>
            </v-layout>
          </v-flex>
        </v-layout>

        <v-layout
          row
          wrap>
          <v-flex 
            d-flex
            md12>
            <campus-news-card />
          </v-flex>
        </v-layout> 
      </template>

      <!-- Breakpoint mdAndUp but no mensa -->
      <template v-if="displayStatsCard && !mensaIsOpen && $vuetify.breakpoint.mdAndUp">
        <v-layout 
          row
          wrap>

          <v-flex
            md6 
            d-flex>
            <v-layout column>
              <v-flex
                d-flex
                md6>
                <upcoming-lectures-card />
              </v-flex>
              <v-flex
                d-flex
                md6>
                <campus-news-card />
              </v-flex>
            </v-layout>
          </v-flex>

          <v-flex 
            d-flex
            md6>
            <v-layout column>
              <v-flex
                d-flex
                md6>
                <stats-card />
              </v-flex>
              <v-flex
                d-flex
                md6>
                <quick-access-card />
              </v-flex>
            </v-layout>
          </v-flex>

          <v-flex
            d-flex
            md6>
            <faculty-news-card />
          </v-flex>
          <v-flex
            d-flex
            md6>
            <last-changes-card />
          </v-flex>

        </v-layout>
      </template>

      <!-- Breakpoint mdAndUp no mensa and no subscribable timetables -->
      <template v-if="!displayStatsCard && !mensaIsOpen && $vuetify.breakpoint.mdAndUp">
        <v-layout 
          row
          wrap>

          <v-flex
            md6 
            d-flex>
            <v-layout column>
              <v-flex
                d-flex
                md6>
                <upcoming-lectures-card />
              </v-flex>
              <v-flex
                d-flex
                md6>
                <campus-news-card />
              </v-flex>
            </v-layout>
          </v-flex>

          <v-flex 
            d-flex
            md6>
            <v-layout column>
              <v-flex
                d-flex
                md6>
                <faculty-news-card />
              </v-flex>
              <v-flex
                d-flex
                md6>
                <last-changes-card />
              </v-flex>
            </v-layout>
          </v-flex>

        </v-layout>
      </template>

      <!-- Breakpoint lgAndUp display everything -->
      <template v-if="displayStatsCard && mensaIsOpen && $vuetify.breakpoint.lgAndUp">

        <v-layout 
          row
          wrap>

          <v-flex 
            d-flex
            lg4>
            <v-layout column>
              <v-flex
                d-flex
                lg6>
                <upcoming-lectures-card />
              </v-flex>
              <v-flex
                d-flex
                lg6>
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
          wrap>
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

      </template>

      <!-- Breakpoint lgAndUp but has no subscribable timetables -->
      <template v-if="!displayStatsCard && mensaIsOpen && $vuetify.breakpoint.lgAndUp">

        <v-flex 
          d-flex
          lg6>
          <v-layout column>
            <v-flex
              d-flex
              lg6>
              <upcoming-lectures-card />
            </v-flex>
            <v-flex
              d-flex
              lg6>
              <faculty-news-card />
            </v-flex>
            <v-flex
              d-flex
              lg6>
              <mensa-card />
            </v-flex>
          </v-layout>
        </v-flex>

        <v-flex 
          d-flex
          lg6>
          <v-layout column>
            <v-flex
              d-flex
              lg6>
              <last-changes-card />
            </v-flex>
            <v-flex
              d-flex
              lg6>
              <campus-news-card />
            </v-flex>
          </v-layout>
        </v-flex>

      </template>  
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
      return false;
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
