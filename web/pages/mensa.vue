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
                      StudiDeal
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
                    <div v-else>
                      <v-row align="center" no-gutters class="py-2 px-2">
                        <v-col cols="12" md="6" class="pr-md-2 mb-2 mb-md-0">
                          <div class="d-flex align-center day-picker">
                            <v-btn icon small @click="prevDay(item)" :disabled="!hasPrev(item)">
                              <v-icon>{{ mdiChevronLeft }}</v-icon>
                            </v-btn>
                            <div class="day-chip-container flex-grow-1 mx-2">
                              <v-chip-group v-model="selectedDay[item.id]" mandatory row>
                                <v-chip
                                  v-for="dp in item.dayPlans"
                                  :key="dp.date"
                                  :value="dp.date"
                                  :color="isToday(dp.date) ? 'primary' : undefined"
                                  :outlined="selectedDay[item.id] !== dp.date"
                                  small
                                  class="mr-1 mb-1"
                                >
                                  {{ dayShortLabel(dp.date) }}
                                </v-chip>
                              </v-chip-group>
                            </div>
                            <v-btn icon small @click="nextDay(item)" :disabled="!hasNext(item)">
                              <v-icon>{{ mdiChevronRight }}</v-icon>
                            </v-btn>
                            <v-btn small text class="ml-2" @click="goToday(item)" :disabled="!hasToday(item)">
                              <v-icon left small>{{ mdiCalendarToday }}</v-icon>
                              Heute
                            </v-btn>
                          </div>
                        </v-col>
                        <v-col cols="12" md="6" class="pl-md-2">
                          <div class="d-flex align-center group-toggle">
                            <span class="mr-3 text-body-2 text--secondary">Gruppieren nach:</span>
                            <v-btn-toggle
                              v-model="groupBy[item.id]"
                              dense
                              mandatory
                            >
                              <v-btn
                                small
                                :value="'lane'"
                                title="Typ (Essen, Beilage, Dessert...)"
                              >
                                Typ
                              </v-btn>
                              <v-btn
                                small
                                :value="'meat'"
                                title="Ernährungsart (Vegan, Rind, Geflügel...)"
                              >
                                Ernährungsart
                              </v-btn>
                            </v-btn-toggle>
                          </div>
                        </v-col>
                      </v-row>

                      <div class="py-2">
                        <mensa-dayplan
                          v-if="getSelectedPlan(item)"
                          :plan="getSelectedPlan(item)"
                          :group-by="groupBy[item.id]"
                        />
                      </div>
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
import { mdiLeaf, mdiFood, mdiCarrot, mdiFoodOutline, mdiFoodForkDrink, mdiClockOutline, mdiFolderInformation, mdiCoffeeOutline, mdiWeatherNight, mdiChevronLeft, mdiChevronRight, mdiCalendarToday } from '@mdi/js';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import 'dayjs/locale/de';

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
      mdiLeaf,
      mdiFood,
      mdiCarrot,
      mdiFoodForkDrink,
      mdiClockOutline,
      mdiFolderInformation,
      mdiCoffeeOutline,
      mdiWeatherNight,
      mdiFoodOutline,
      mdiChevronLeft,
      mdiChevronRight,
      mdiCalendarToday,
      selectedDay: {},
      groupBy: {}
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
    getDayOptions (dayPlans) {
      if (!dayPlans) return [];
      return dayPlans.map(dp => ({
        label: this.dayLabel(dp.date),
        value: dp.date
      }));
    },
    dayLabel (dateStr) {
      const day = this.$dayjs(dateStr.toString());
      const prefix = day.isSame(this.$dayjs(), 'day') ? 'Heute' : day.format('dddd');
      return `${prefix} - ${day.format('DD.MM.YYYY')}`;
    },
    dayShortLabel (dateStr) {
      const day = this.$dayjs(dateStr.toString());
      const isToday = day.isSame(this.$dayjs(), 'day');
      return isToday ? `Heute • ${day.format('DD.MM')}` : `${day.format('dd')} • ${day.format('DD.MM')}`;
    },
    isToday (dateStr) {
      return this.$dayjs(dateStr.toString()).isSame(this.$dayjs(), 'day');
    },
    ensureDefaultsFor (item) {
      if (!this.groupBy[item.id]) this.$set(this.groupBy, item.id, 'lane');
      if (!this.selectedDay[item.id]) {
        const first = item.dayPlans && item.dayPlans[0];
        if (first) this.$set(this.selectedDay, item.id, first.date);
      }
    },
    getSelectedPlan (item) {
      this.ensureDefaultsFor(item);
      const sel = this.selectedDay[item.id];
      if (!sel) return null;
      return (item.dayPlans || []).find(dp => dp.date === sel) || null;
    },
    indexOfSelected (item) {
      const list = item.dayPlans || [];
      return list.findIndex(dp => dp.date === this.selectedDay[item.id]);
    },
    hasPrev (item) {
      const idx = this.indexOfSelected(item);
      return idx > 0;
    },
    hasNext (item) {
      const idx = this.indexOfSelected(item);
      const list = item.dayPlans || [];
      return idx !== -1 && idx < list.length - 1;
    },
    hasToday (item) {
      return (item.dayPlans || []).some(dp => this.isToday(dp.date)) && !this.isToday(this.selectedDay[item.id] || '');
    },
    prevDay (item) {
      const list = item.dayPlans || [];
      const idx = this.indexOfSelected(item);
      if (idx > 0) this.$set(this.selectedDay, item.id, list[idx - 1].date);
    },
    nextDay (item) {
      const list = item.dayPlans || [];
      const idx = this.indexOfSelected(item);
      if (idx !== -1 && idx < list.length - 1) this.$set(this.selectedDay, item.id, list[idx + 1].date);
    },
    goToday (item) {
      const today = (item.dayPlans || []).find(dp => this.isToday(dp.date));
      if (today) this.$set(this.selectedDay, item.id, today.date);
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

.group-toggle .v-btn--active {
  background-color: var(--v-primary-base) !important;
  color: white !important;
}

.day-picker .day-chip-container {
  overflow-x: auto;
  white-space: nowrap;
}
.day-picker .v-chip-group {
  display: inline-flex;
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
