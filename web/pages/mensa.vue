<template>
  <v-container
    fluid
    grid-list-md
    hide-overlay
    class="container-padding"
  >
    <h2>Mensa Wolfenbüttel</h2>
    <span>Montag bis Freitag 11:15 - 14:15 Uhr</span>
    <br>
    <span class="explanation">
      <span>
        Vegetarisch
        <v-icon
          :color="getIconColor()"
          small
        >
          mdi-leaf
        </v-icon>
      </span>
      &nbsp;
      <span>
        Vegan
        <v-icon
          color="green"
          small
        >
          mdi-leaf
        </v-icon>
      </span>
    </span>
    <v-divider class="divider" />
    <no-ssr>
      <v-carousel
        :hide-controls="$vuetify.breakpoint.smAndDown"
        :hide-delimiters="!$vuetify.breakpoint.smAndDown"
        :light="!isDark"
        :cycle="false"
        height="100%"
      >
        <template v-if="$vuetify.breakpoint.smAndDown">
          <v-carousel-item
            v-for="dayPlan in plans"
            :key="dayPlan.date"
          >
            <v-layout
              row
              class="carousel-delimiter-padding"
            >
              <mensa-dayplan :plan="dayPlan" />
            </v-layout>
          </v-carousel-item>
        </template>
        <template v-if="!$vuetify.breakpoint.smAndDown">
          <v-carousel-item
            v-for="dayPlanGroup in groupedDayPlans"
            :key="dayPlanGroup[0].date"
          >
            <v-layout
              row
              class="carousel-control-padding"
            >
              <mensa-dayplan
                :plan="dayPlanGroup[0]"
              />
              <mensa-dayplan
                v-if="dayPlanGroup[1]"
                :plan="dayPlanGroup[1]"
              />
              <mensa-dayplan
                v-if="dayPlanGroup[2]"
                :plan="dayPlanGroup[2]"
              />
            </v-layout>
          </v-carousel-item>
        </template>
      </v-carousel>
    </no-ssr>
    <span class="disclaimer">
      Quelle: openmensa.org
    </span>
  </v-container>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex';
import MensaDayplan from '../components/mensa-dayplan.vue';
import * as moment from 'moment';

export default {
  name: 'MensaPage',
  head() {
    return {
      title: 'Mensaplan',
      meta: [
        { hid: 'description', name: 'description', content: 'Mensaplan' },
        { hid: 'og:description', property: 'og:description', content: 'Mensaplan' },
      ],
    };
  },
  components: {
    MensaDayplan
  },
  computed: {
    ...mapState({
      plans: (state) => state.mensa.plans,
      lazyLoad: (state) => state.lazyLoad,
      isDark: (state) => state.ui.isDark,
    }),
    groupedDayPlans() {
      const grouped = [];
      for (let i = 0; i < this.plans.length; i += 3) {
          grouped.push(this.plans.slice(i, i + 3));
      }
      return grouped;
    }
  },
  mounted() {
    if (this.lazyLoad) {
      // static build -> no mensa plan is in the store
      this.load();
    }
  },
  methods: {
    ...mapActions({
      load: 'mensa/load',
    }),
    ...mapMutations({
      setSidenav: 'ui/setSidenav',
    }),
    getIconColor(item) {
      if(item == undefined || item.notes.includes('Vegetarisch')){
        return this.isDark? 'white' : 'black';
      }else if(item.notes.includes('Vegan')){
        return 'green';
      }
    },
  },
  middleware: 'cached',
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

.v-window__container,
.v-image {
  height: 100% !important;
}

.v-carousel__controls {
  height: 40px !important;
}

.explanation{
  opacity: 0.5;
}

.disclaimer {
  padding-top: 2px;
  display: flex;
  justify-content: flex-end;
  opacity: 0.5;
  font-size: 12px;
}

.container-padding{
  padding-bottom: 3px;
}

.divider {
  padding: 5px;
}
</style>