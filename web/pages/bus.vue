<template>
  <v-container
    fluid
    class="mt-3 px-4"
  >
    <v-row
      justify="center"
    >
      <v-col
        v-for="direction in directions"
        :key="direction"
        cols=12
        md=5
        xl=3
      >
        <v-card
          v-if="departures"
          class="pa-2"
        >
          <v-card-title>
            <div class="text-h5">
              {{ directionLabel[direction] }}
            </div>
          </v-card-title>

          <v-list>
            <v-list-item
              v-for="departure in removePastDepartures(departures[direction])"
              :key="departure.date"
            >
              <v-list-item-content
                class="pb-0 pt-1"
              >
                <p>
                  <v-chip
                    outlined
                    :color="lineColor(departure.line)"
                    class="mr-2"
                  >
                    Linie {{ departure.line }}
                  </v-chip>
                  {{ absoluteDate(departure.date) }} Uhr
                  <template v-if="minutesUntilDate(departure.date) < 15">
                    ({{ relativeDate(departure.date) }})
                  </template>
                </p>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
        <v-skeleton-loader
          v-else
          type="article"
        />
      </v-col>
    </v-row>

    <span class="pt-4 d-flex justify-end text-caption text--secondary">
      Quelle: Deutsche Bahn HAFAS
    </span>
  </v-container>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex';

export default {
  name: 'BusPage',
  head () {
    return {
      title: 'Busplan',
      meta: [
        { hid: 'description', name: 'description', content: 'Busplan' },
        { hid: 'og:description', property: 'og:description', content: 'Busplan' }
      ]
    };
  },
  data () {
    return {
      directions: ['exerToFh', 'fhToExer'],
      directionLabel: {
        exerToFh: 'Exer zu Fachhochschule',
        fhToExer: 'Fachhochschule zu Exer'
      },
      refreshTimer: undefined,
      relativeDate: (str) => this.$dayjs(str).fromNow(),
      absoluteDate: (str) => this.$dayjs(str).format('HH:mm'),
      minutesUntilDate: (str) => this.$dayjs(str).diff(this.$dayjs(), 'minutes'),
      lineColor: (line) => ['pink', 'purple', 'blue'][parseInt(line) % 4]
    }
  },
  computed: {
    ...mapState({
      departures: (state) => state.bus.departures
    })
  },
  mounted () {
    this.$nextTick(() => {
      this.$nuxt.$loading.start()
    })
    this.load()
    this.refreshTimer = setInterval(() => this.load(), 60000)
  },
  destroyed () {
    clearInterval(this.refreshTimer)
  },
  methods: {
    ...mapActions({
      load: 'bus/load'
    }),
    ...mapMutations({
      setSidenav: 'ui/setSidenav'
    }),
    removePastDepartures (departures) {
    // remove all departures older than 10 minutes ago
      return departures ? departures.filter(dep => (this.minutesUntilDate(dep.date) > -10)) : null;
    }
  },
  middleware: 'cached'
};
</script>
<style lang="scss" scoped>
.v-chip:hover::before {
  // disable animation on hover, bc the chips are not selectable
  // we can't use disabled prop because it changes the color as well
  opacity: 0.0;
}
</style>
