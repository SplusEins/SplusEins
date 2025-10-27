<template>
  <v-container
    fluid
  >
    <div>
      <v-tabs
        :value="activeTab"
        center-active
        show-arrows
      >
        <v-tab
          v-for="(item, idx) in plans"
          :key="item.id"
          :value="idx"
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
                md6
                xs12
                style="max-width: 100%; flex-basis: 100%"
              >
                <v-card flat>
                  <div
                    class="d-flex align-start flex-wrap"
                    style="row-gap: 8px;"
                  >
                    <div
                      class="d-flex flex-column pr-4"
                      style="min-width:0; max-width: 420px;"
                    >
                      <div class="d-flex align-center text-body-2 mb-1">
                        <v-icon
                          color="indigo"
                          class="mr-2"
                        >
                          {{ mdiFolderInformation }}
                        </v-icon>
                        <a
                          :href="getMensaURL(item.url)"
                          class="text-decoration-none"
                          target="_blank"
                        >Offizielle Mensa-Seite mit Öffnungszeiten</a>
                      </div>

                      <div class="d-flex flex-wrap align-center text-body-2 text--secondary">
                        <v-chip
                          class="ma-1"
                          small
                          outlined
                        >
                          <v-icon
                            left
                            small
                            color="orange"
                          >
                            {{ mdiCarrot }}
                          </v-icon>
                          Vegetarisch
                        </v-chip>
                        <v-chip
                          class="ma-1"
                          small
                          outlined
                        >
                          <v-icon
                            left
                            small
                            color="green"
                          >
                            {{ mdiSprout }}
                          </v-icon>
                          Vegan
                        </v-chip>
                        <v-chip
                          class="ma-1"
                          small
                          outlined
                        >
                          <v-icon
                            left
                            small
                            color="red"
                          >
                            {{ mdiCurrencyEur }}
                          </v-icon>
                          StudiDeal
                        </v-chip>
                      </div>
                    </div>

                    <div
                      class="flex-grow-1"
                      style="min-width:0;"
                    >
                      <div
                        class="d-flex align-center text-body-2 mb-1"
                      >
                        <v-icon
                          color="indigo"
                          class="mr-2"
                        >
                          {{ mdiClockOutline }}
                        </v-icon>
                        Öffnungszeiten:
                      </div>
                      <div
                        v-if="item.opening_hours.length > 0"
                        class="d-flex flex-wrap text-body-2 text--secondary"
                      >
                        <v-chip
                          v-for="(opening, key) in item.opening_hours"
                          :key="key"
                          class="ma-1"
                          outlined
                          small
                        >
                          <v-icon
                            left
                            small
                            class="mr-1"
                          >
                            {{ openingTimeIcon(opening) }}
                          </v-icon>
                          {{ openingTimeFormat(opening) }}
                        </v-chip>
                      </div>
                      <div
                        v-else
                        class="text-body-2 text--secondary"
                      >
                        Bitte vor Ort informieren.
                      </div>
                    </div>
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
import { mdiSprout, mdiCurrencyEur, mdiCarrot, mdiFoodOutline, mdiFoodForkDrink, mdiClockOutline, mdiFolderInformation, mdiCoffeeOutline, mdiWeatherNight } from '@mdi/js';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import 'dayjs/locale/de';
import { locationMap } from '~/lib/mensa-location-map.js';

dayjs.extend(isoWeek);
dayjs.locale('de'); // Setzt die Sprache global auf Deutsch

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
      mdiSprout,
      mdiCurrencyEur,
      mdiCarrot,
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
      plans: (state) => state.mensa.plans,
      location: (state) => state.mensa.location
    }),
    activeTab () {
      if (!this.plans || this.plans.length === 0) return 0;
      const mappedName = locationMap[this.location] || locationMap.wf;
      const idx = this.plans.findIndex(p => p.name === mappedName);
      return idx !== -1 ? idx : 0;
    }
  },
  mounted () {
    this.load();
  },
  methods: {
    ...mapActions({
      load: 'mensa/load'
    }),
    ...mapMutations({
      setSidenav: 'ui/setSidenav',
      setLocation: 'mensa/setLocation'
    }),
    getMensaURL (url) {
      return `https://www.stw-on.de/${url}`;
    },
    noMealsAvailable (plans) {
      return (plans != null && plans.length === 0);
    },
    isOpen (opening_hours) {
      const now = dayjs();
      const currentDay = now.isoWeekday(); // Gibt den ISO-Wochentag zurück (1 = Montag, 7 = Sonntag)
      const currentTime = now.format('HH:mm:ss'); // Gibt die Uhrzeit im Format HH:mm:ss zurück

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
      const formatDay = (day) => dayjs().isoWeekday(day).format('dddd');
      const dayRange = hours.start_day === hours.end_day
        ? formatDay(hours.start_day)
        : `${formatDay(hours.start_day)} - ${formatDay(hours.end_day)}`;
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
}
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
  padding-bottom: 10px;
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
