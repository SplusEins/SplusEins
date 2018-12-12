<template>
  <v-card>
    <v-container
      fluid
      grid-list-md>
      <v-layout
        row
        wrap>
        <v-flex xs6>
          <last-changes-card />
        </v-flex>

        <v-flex xs6>
          <news-card />
        </v-flex>

        <v-flex
          v-show="favorites.length > 0"
          xs6>
          <favorites-card />
        </v-flex>

        <v-flex xs6>
          <upcoming-lectures-card />
        </v-flex>

        <v-flex
          v-show="mensaIsOpen"
          xs6>
          <mensa-card />
        </v-flex>
      </v-layout>
    </v-container>
  </v-card>
</template>

<script>
import { mapState } from 'vuex';
import * as moment from 'moment';
import UpcomingLecturesCard from '../components/upcoming-lectures-card.vue';
import LastChangesCard from '../components/last-changes-card.vue';
import FavoritesCard from '../components/favorites-card.vue';
import MensaCard from '../components/mensa-card.vue';
import NewsCard from '../components/news-card.vue';

export default {
  name: 'IndexPage',
  components: {
    UpcomingLecturesCard,
    LastChangesCard,
    FavoritesCard,
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
  },
  mounted() {
    if (this.lazyLoad) {
      // static build -> no mensa plan is in the store
      //this.loadWeek();
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

