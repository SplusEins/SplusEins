<template>
  <v-card>
    <v-container
      fluid
      grid-list-md>
      <v-layout
        row
        wrap>
        <v-flex xs6>
          <v-card>
            <v-card-title primary-title>
              <div>
                <div class="headline">Letzte Änderungen</div>
                <ul>
                  <li>Auf der Startseite werden die wichtigsten Informationen in einem Dashboard zusammengefasst.</li>
                  <li>Der Essensplan der Mensa Wolfenbüttel wird angezeigt.</li>
                  <li>SplusEins kann auf Smartphones mit einem modernen Browser als App installiert werden.</li>
                </ul>
              </div>
            </v-card-title>
          </v-card>
        </v-flex>

        <v-flex xs6>
          <v-card>
            <v-card-title primary-title>
              <div>
                <div class="headline">Neues von der Ostfalia</div>
                <span>Sensation: Professor steckt USB-Stick im ersten Versuch richtig herum in den Port</span>
              </div>
            </v-card-title>
            <v-card-actions>
              <v-spacer />
              <v-btn
                flat
                color="primary"
                href="https://ostfalia.de">
                Auf ostfalia.de weiterlesen
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>

        <v-flex
          v-show="favorites.length > 0"
          xs6>
          <v-card>
            <v-card-title primary-title>
              <div>
                <div class="headline">Favoriten</div>
                <ul>
                  <v-btn
                    v-for="route in customSchedulesAsRoutes"
                    :key="route.query.name"
                    :to="route"
                    flat
                    nuxt>
                    {{ route.query.name }}
                  </v-btn>
                  <v-btn
                    v-for="favorite in favorites"
                    :key="favorite.id"
                    :to="favorite.route"
                    flat
                    nuxt>
                    {{ favorite.description }}
                  </v-btn>
                </ul>
              </div>
            </v-card-title>
          </v-card>
        </v-flex>

        <v-flex xs6>
          <v-card>
            <v-card-title primary-title>
              <div>
                <div class="headline">Nächste Vorlesungen</div>
                <span>Frohe Weihnachten</span>
              </div>
            </v-card-title>
            <v-card-actions>
              <v-btn icon>
                <v-icon>mdi-share</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>

        <v-flex
          v-show="mensaMenus.length > 0 && mensaIsOpen"
          xs6>
          <v-card>
            <v-card-title primary-title>
              <div>
                <div class="headline">Mensa Wolfenbüttel Heute</div>
                <ul>
                  <li
                    v-for="menu in mensaMenus"
                    :key="menu.id">
                    {{ menu.name }}
                  </li>
                </ul>
              </div>
            </v-card-title>
            <v-card-actions>
              <v-spacer />
              <v-btn
                to="/mensa"
                flat
                nuxt>
                Öffnen
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </v-card>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import * as moment from 'moment';
import { customTimetableToRoute } from '../store/splus';

export default {
  name: 'IndexPage',
  async fetch({ store, params }) {
    if (process.static) {
      store.commit('enableLazyLoad');
    }

    if (process.client || !store.state.lazyLoad) {
      await store.dispatch('mensa/loadWeek');
      //await store.dispatch('splus/load');
    } else {
      console.log('lazy loading is enabled: not fetching mensa plan and timetable');
    }
  },
  head() {
    return {
      title: 'Startseite',
    };
  },
  data() {
    return {
      customTimetableToRoute,
    };
  },
  computed: {
    mensaMenus() {
      if (this.weekPlan.length == 0) {
        return [];
      }

      return Object.values(this.weekPlan[0].data)
        .filter(({ category }) => category.startsWith('Essen '));
    },
    mensaIsOpen() {
      if (this.weekPlan.length == 0) {
        return false;
      }

      return this.weekPlan[0].date == parseInt(moment().format('YYYYMMDD'));
    },
    ...mapState({
      favorites: (state) => state.splus.favoriteSchedules,
      weekPlan: (state) => state.mensa.weekPlan,
    }),
    ...mapGetters({
      customSchedulesAsRoutes: 'splus/customSchedulesAsRoutes',
    }),
  },
  mounted() {
    if (this.lazyLoad) {
      // static build -> no mensa plan is in the store
      //this.loadWeek();
    }
  },
  methods: {
    trackMatomoEvent(category, action, name) {
      this.$matomo.trackEvent(category, action, name);
    },
  }
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

