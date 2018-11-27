<template>
  <v-container 
    fluid 
    grid-list-md
    hide-overlay
    class="container-padding">

    <h2>Mensa Plan</h2>

    <v-divider class="divider"/>

    <v-layout 
      :wrap="$vuetify.breakpoint.smAndDown"
      row>
      <v-flex
        v-for="dayPlan in weekPlan"
        :key="dayPlan.id"
        xs12>
        <v-card 
          height="100%">
          <v-card-title> 
            <h4>{{ getDayHeader(dayPlan) }}</h4>
          </v-card-title>
          <v-divider />
          <v-list 
            v-for="item in dayPlan.data"
            :key="item.id"
            dense
            two-line>
            <v-list-tile>
              <v-list-tile-content class="content">
                <span class="category">{{ item.category }}:</span>
                <span>{{ item.name }} ({{ getPriceLabel(item.prices.students) }})</span>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-card>
      </v-flex>
    </v-layout> 
    <span class="disclaimer">
      Quelle: openmensa.org
    </span>
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import * as moment from 'moment';

export default {
  name: 'MensaPage',
  head() {
    return {
      title: 'Mensa Plan',
    };
  },
  async fetch({ store, params }) {
    if (process.static) {
      store.commit('enableLazyLoad');
    }

    if (process.client || !store.state.lazyLoad) {
      await store.dispatch('mensa/loadWeek');
    } else {
      console.log('lazy loading is enabled: not fetching mensa plan');
    }
  },
  computed: {
    ...mapState({
      weekPlan: (state) => state.mensa.weekPlan,
      lazyLoad: (state) => state.lazyLoad,
    }),
  },
  mounted(){
    if (this.lazyLoad) {
      // static build -> no mensa plan is in the store
      this.loadWeek();
    }
  },
  methods: {
    ...mapActions({
      loadWeek: 'mensa/loadWeek',
    }),
    getDayHeader(dayPlan){
      const day = moment(dayPlan.date);
      return day.format('dddd') + " - " + day.format('DD.MM.YYYY');
    },
    getPriceLabel(price){
      const euros = Math.floor(price);
      let cents = Math.round((price - euros) * 100);
      cents = cents != 0 ? cents : '00';
      return euros + ',' + cents + '€';
    },
  },
};
</script>


<style scoped lang="scss">

.category {
  font-weight: bold;
}

.content {
  justify-content: normal;
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