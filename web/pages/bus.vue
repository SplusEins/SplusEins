<template>
  <v-container
    fluid
    grid-list-md
  >
    <v-layout wrap>
      <v-flex
        v-for="direction in directions"
        :key="direction"
      >
        <v-card>
          <v-card-title>
            <div class="headline">
              {{ directionLabel[direction] }}
            </div>
          </v-card-title>

          <v-list>
            <v-list-tile
              v-for="departure in departures[direction]"
              :key="departure.date"
            >
              <v-list-tile-content>
                <p>
                  <v-chip
                    outline
                    :color="lineColor(departure.line)"
                  >
                    Linie {{ departure.line }}
                  </v-chip>
                  {{ absoluteDate(departure.date) }} Uhr
                  <template v-if="minutesUntilDate(departure.date) < 15">
                    ({{ relativeDate(departure.date) }})
                  </template>
                </p>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-card>
      </v-flex>
    </v-layout>

    <span class="disclaimer">
      Quelle: Deutsche Bahn HAFAS
    </span>
  </v-container>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex';
import * as moment from 'moment';

export default {
  name: 'BusPage',
  head() {
    return {
      title: 'Busplan',
      meta: [
        { hid: 'description', name: 'description', content: 'Busplan' },
        { hid: 'og:description', property: 'og:description', content: 'Busplan' },
      ],
    };
  },
  computed: {
    ...mapState({
      departures: (state) => state.bus.departures,
      lazyLoad: (state) => state.lazyLoad,
      isDark: (state) => state.ui.isDark,
    }),
  },
  data() {
    return {
      directions: ['exerToFh', 'fhToExer'],
      directionLabel: {
        'exerToFh': 'Exer zu Fachhochschule',
        'fhToExer': 'Fachhochschule zu Exer',
      },
      refreshTimer: undefined,
      relativeDate: (str) => moment(str).fromNow(),
      absoluteDate: (str) => moment(str).format('HH:mm'),
      minutesUntilDate: (str) => moment(str).diff(moment(), 'minutes'),
      lineColor: (line) => ['pink', 'purple', 'blue'][parseInt(line) % 4],
    }
  },
  mounted() {
    if (this.lazyLoad) {
      // static build -> no mensa plan is in the store
      this.load()
    }
    if (process.client) {
      this.refreshTimer = setInterval(() => this.load(), 60000)
    }
  },
  destroyed() {
    if (process.client) {
      clearInterval(this.refreshTimer)
    }
  },
  methods: {
    ...mapActions({
      load: 'bus/load',
    }),
    ...mapMutations({
      setSidenav: 'ui/setSidenav',
    }),
  },
  middleware: 'cached',
};
</script>


<style lang="scss">
.disclaimer {
  padding-top: 2px;
  display: flex;
  justify-content: flex-end;
  opacity: 0.5;
  font-size: 12px;
}
</style>