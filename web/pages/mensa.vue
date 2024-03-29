<template>
  <v-container
    fluid
    class="pa-4 pa-md-7"
  >
    <div class="text-h5">
      Mensa Wolfenbüttel
    </div>
    <div class="text-body-2">
      <a href="https://www.stw-on.de/wolfenbüttel/essen/mensa/">Offizielle Mensa-Seite mit Öffnungszeiten</a>
    </div>
    <div class="text-body-2 text--secondary d-flex">
      <div class="d-flex pr-4">
        Vegetarisch
        <v-icon
          :color="$vuetify.theme.dark ? 'white' : 'black'"
          small
          class="align-self-center ml-1"
        >
          {{ mdiLeaf }}
        </v-icon>
      </div>
      <div class="d-flex">
        Vegan
        <v-icon
          color="green"
          small
          class="align-self-center ml-1"
        >
          {{ mdiLeaf }}
        </v-icon>
      </div>
    </div>
    <v-divider class="my-1" />
    <no-ssr>
      <v-alert
        v-if="noMealsAvailable"
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
            v-for="dayPlan in plans"
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
              v-for="dayPlanGroup in groupedDayPlans"
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
  </v-container>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex';
import MensaDayplan from '../components/mensa-dayplan.vue';
import { mdiLeaf } from '@mdi/js'

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
      mdiLeaf
    }
  },
  components: {
    MensaDayplan
  },
  computed: {
    ...mapState({
      plans: (state) => state.mensa.plans
    }),
    groupedDayPlans () {
      if (!this.plans) return [];
      const grouped = [];
      for (let i = 0; i < this.plans.length; i += 3) {
        grouped.push(this.plans.slice(i, i + 3));
      }
      return grouped;
    },
    noMealsAvailable () {
      // If plans have been loaded successfully and no plans were available
      return (this.plans != null && this.plans.length === 0);
    }
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
    })
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
</style>
