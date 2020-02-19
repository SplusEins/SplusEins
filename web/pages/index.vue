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
            v-show="$vuetify.breakpoint.mdAndUp"
            :d-flex="$vuetify.breakpoint.mdAndUp"
          >
            <faculty-news-card />
          </v-flex>
        </v-layout>
      </v-flex>

      <v-flex
        d-flex
        md6
        lg6
        order-xs6
        order-md2
      >
        <campus-news-card />
      </v-flex>

      <v-flex
        v-show="!$vuetify.breakpoint.mdAndUp"
        :d-flex="!$vuetify.breakpoint.mdAndUp"
        order-xs7
        order-md7
      >
        <faculty-news-card />
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
        order-xs5
        order-md6
      >
        <v-layout :column="$vuetify.breakpoint.lgAndUp || $vuetify.breakpoint.xs">
          <v-flex d-flex>
            <support-us-card />
          </v-flex>
          <v-flex d-flex>
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
import SupportUsCard from '../components/support-us-card.vue';
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
    SupportUsCard,
    StatsCard,
  },
  computed: {
    displayMensaCard() {
      if (this.mensaPlans.length == 0) {
        return false;
      }
      // display if next plan is from today or from tomorrow
      return moment().isSame(this.mensaPlans[0].date, 'day') || moment().add(1, 'days').isSame(this.mensaPlans[0].date, 'day');
    },
    ...mapState({
      mensaPlans: (state) => state.mensa.plans,
    }),
    ...mapGetters({
      customSchedulesAsRoutes: 'splus/customSchedulesAsRoutes',
      hasSubscribableTimetables: 'splus/hasSubscribableTimetables',
    }),
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
  },
  middleware: 'cached',
};
</script>
