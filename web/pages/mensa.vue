<template>
  <v-container
    fluid
  >
    <div>
      <v-tabs>
        <v-tab
          v-for="item in plans"
          :key="item.id"
          ripple
        >
          {{ item.name }}
          <v-tooltip
            bottom
            v-if="isOpen(item.opening_hours)"
          >
            <template #activator="{ on }">
              <span v-on="on">
                <v-chip
                  class="ml-2"
                  color="green"
                  text-color="white"
                >
                  <v-icon>
                    {{ mdiFoodForkDrink }}
                  </v-icon>
                </v-chip>
              </span>
            </template>
            <span>Aktuell geöffnet</span>
          </v-tooltip>
        </v-tab>
        <v-tab-item
          v-for="item in plans"
          class="pa-1 pa-md-1"
          :key="item.id"
        >
          <v-container grid-list-md>
            <v-layout
              row
              wrap
            >
              <v-flex
                md4
                xs12
              >
                <v-card flat>
                  <div class="text-body-2">
                    <v-icon
                      color="indigo"
                      class="align-self-center"
                    >
                      {{ mdiFolderInformation }}
                    </v-icon>
                    <a
                      :href="getMensaURL(item.url)"
                      style="text-decoration: none;"
                      target="_blank"
                    >Offizielle Mensa-Seite mit Öffnungszeiten</a>
                  </div>
                  <div class="text-body-2 text--secondary d-flex">
                    <div class="d-flex pr-2">
                      Vegetarisch
                      <v-icon
                        color="green"
                        small
                        class="align-self-center ml-1"
                      >
                        {{ mdiCarrot }}
                      </v-icon>
                    </div>
                    <div class="d-flex pr-2">
                      Vegan
                      <v-icon
                        color="green"
                        small
                        class="align-self-center ml-1"
                      >
                        {{ mdiLeaf }}
                      </v-icon>
                    </div>
                    <div class="d-flex">
                      Niedersachsen Menü
                      <v-icon
                        color="red"
                        small
                        class="align-self-center ml-1"
                      >
                        {{ mdiFood }}
                      </v-icon>
                    </div>
                  </div>
                </v-card>
              </v-flex>
              <!--<v-flex md2 xs12>
              <v-card flat>
                <div class="text-body-2">
                  <v-icon
                      color="indigo"
                      class="align-self-center"
                    >
                      {{ mdiMapMarkerOutline }}
                    </v-icon>
                    Standort:
                </div>
                <div class="text-body-2 text--secondary d-flex">
                  <div class="d-flex pr-2">
                    {{ item.address.street }},<br />{{ item.address.zip }} {{ item.address.city }}
                  </div>
                </div>
              </v-card>
            </v-flex>-->
              <v-flex
                md8
                xs12
              >
                <v-card flat>
                  <div class="text-body-2">
                    <v-icon
                      color="indigo"
                      class="align-self-center"
                    >
                      {{ mdiClockOutline }}
                    </v-icon>
                    Öffnungszeiten:
                  </div>
                  <div
                    class="text-body-2 text--secondary d-flex chip-container"
                    v-if="item.opening_hours.length > 0"
                  >
                    <div
                      class="d-flex pr-2"
                      v-for="(opening, key) in item.opening_hours"
                      :key="key"
                    >
                      <v-chip
                        outlined
                        small
                      >
                        <v-icon
                          left
                          small
                        >
                          {{ openingTimeIcon(opening) }}
                        </v-icon>
                        {{ openingTimeFormat(opening) }}
                      </v-chip>
                    </div>
                  </div>
                  <div
                    class="text-body-2 text--secondary d-flex chip-container"
                    v-else
                  >
                    Bitte vor Ort informieren.
                  </div>
                </v-card>
              </v-flex>
              <v-flex xs12>
                <v-card flat>
                  <v-divider class="my-1" />
                  <no-ssr>
                    <v-alert
                      v-if="noMealsAvailable(item.dayPlans)"
                      type="info"
                      class="my-6"
                    >
                      Aktuell sind keine Pläne verfügbar.
                    </v-alert>
                    <div
                      class="py-2"
                      v-else
                    >
                      <v-row v-if="$vuetify.breakpoint.mobile">
                        <v-col
                          v-for="dayPlan in item.dayPlans"
                          :key="dayPlan.date"
                          cols=12
                        >
                          <mensa-dayplan :plan="dayPlan" />
                        </v-col>
                      </v-row>

                      <v-carousel
                        v-else
                        show-arrows
                        hide-delimiters
                        hide-delimiter-background
                        :light="!$vuetify.theme.dark"
                        height="100%"
                      >
                        <template>
                          <v-carousel-item
                            v-for="dayPlanGroup in groupedDayPlans(item.dayPlans)"
                            :key="dayPlanGroup[0].date"
                          >
                            <v-row
                              dense
                              class="carousel-control-padding"
                            >
                              <v-col
                                v-for="(_, i) in 3"
                                :key="i"
                              >
                                <mensa-dayplan
                                  v-if="dayPlanGroup[i]"
                                  :plan="dayPlanGroup[i]"
                                />
                              </v-col>
                            </v-row>
                          </v-carousel-item>
                        </template>
                      </v-carousel>
                    </div>
                  </no-ssr>
                </v-card>
              </v-flex>
            </v-layout>
          </v-container>
        </v-tab-item>
      </v-tabs>
    </div>
  </v-container>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex';
import MensaDayplan from '../components/mensa-dayplan.vue';
import { mdiLeaf, mdiFood, mdiCarrot, mdiMapMarkerOutline, mdiFoodOutline, mdiFoodForkDrink, mdiClockOutline, mdiFolderInformation, mdiCoffeeOutline, mdiWeatherNight } from '@mdi/js';
import * as moment from 'moment';

export default {
  name: 'MensaPage',
  head () {
    return {
      title: 'Mensaplan',
      meta: [
        { hid: 'description', name: 'description', content: 'Mensaplan' },
        { hid: 'og:description', property: 'og:description', content: 'Mensaplan' }
      ]
    };
  },
  data () {
    return {
      mdiLeaf,
      mdiFood,
      mdiCarrot,
      mdiMapMarkerOutline,
      mdiFoodForkDrink,
      mdiClockOutline,
      mdiFolderInformation,
      mdiCoffeeOutline,
      mdiWeatherNight,
      mdiFoodOutline
    }
  },
  components: {
    MensaDayplan
  },
  computed: {
    ...mapState({
      plans: (state) => state.mensa.plans
    })
  },
  mounted () {
    this.$nextTick(() => {
      this.$nuxt.$loading.start()
    })
    this.load();
  },
  methods: {
    ...mapActions({
      load: 'mensa/load'
    }),
    ...mapMutations({
      setSidenav: 'ui/setSidenav'
    }),
    getMensaURL (url) {
      return `https://www.stw-on.de/${url}`;
    },
    noMealsAvailable (plans) {
      // If plans have been loaded successfully and no plans were available
      return (plans != null && plans.length === 0);
    },
    isOpen (opening_hours) {
      const now = moment();
      const currentDay = now.isoWeekday();
      const currentTime = now.format('HH:mm:ss');

      return opening_hours.some(({ start_day, end_day, start_time, end_time }) =>
        currentDay >= start_day &&
        currentDay <= end_day &&
        currentTime >= start_time &&
        currentTime <= end_time
      );
    },
    groupedDayPlans (plans) {
      if (!plans) return [];
      const grouped = [];
      for (let i = 0; i < plans.length; i += 3) {
        grouped.push(plans.slice(i, i + 3));
      }
      return grouped;
    },
    openingTimeFormat (hours) {
      moment.locale('de');
      const formatDay = (day) => moment().isoWeekday(day).format('dddd');
      const dayRange = hours.start_day === hours.end_day ? formatDay(hours.start_day) : `${formatDay(hours.start_day)} - ${formatDay(hours.end_day)}`;
      return `${dayRange}, ${hours.start_time.slice(0, 5)}-${hours.end_time.slice(0, 5)}`;
    },
    openingTimeIcon (hours) {
      switch (hours.time) {
        case 'morning':
          return mdiCoffeeOutline;
        case 'noon':
          return mdiFoodOutline;
        case 'evening':
          return mdiWeatherNight;
      }
    }
  },
  middleware: 'cached'
};
</script>

<style lang="scss">

.v-carousel {
  box-shadow: none !important;
}

.carousel-delimiter-padding {
  padding-bottom: 40px;
}

.carousel-control-padding {
  padding: 0 50px;
  margin: 0px !important;
}

.v-carousel__controls {
  height: 40px !important;
}

.v-window__prev, .v-window__next {
  margin: 0 !important;
}

.chip-container {
  display: flex;
  flex-wrap: nowrap; /* Verhindert das Umbruch von Chips */
  overflow-x: auto; /* Aktiviert das horizontale Scrollen */
  padding: 5px 0;
}

.chip-container .v-chip {
  white-space: nowrap; /* Verhindert den Umbruch innerhalb der Chips */
}

/* Styling der Scrollleiste - Standard: Sichtbar auf Desktops */
.chip-container::-webkit-scrollbar {
  height: 4px; /* Höhe der horizontalen Scrollleiste */
}

/* Daumen der Scrollleiste */
.chip-container::-webkit-scrollbar-thumb {
  background-color: var(--v-anchor-base);; /* Farbgebung des Daumens */
  border-radius: 4px; /* Abgerundete Ecken des Daumens */
  border: 2px solid var(--v-anchor-base);; /* Dunklere Grenze um den Daumen */
}

/* Hintergrund der Scrollleiste */
.chip-container::-webkit-scrollbar-track {
  background: #e0e0e0; /* Hellerer Hintergrund für die Scrollleiste */
  border-radius: 4px;
}

/* Pfeile an den Enden der Scrollleiste ausblenden */
.chip-container::-webkit-scrollbar-button {
  display: none;
}

/* Auf mobilen Geräten (max-width: 600px) die Scrollleiste ausblenden */
@media (max-width: 600px) {
  .chip-container::-webkit-scrollbar {
    height: 0px; /* Höhe der horizontalen Scrollleiste */
  }
}
</style>
