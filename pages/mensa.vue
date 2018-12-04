<template>
  <v-container 
    fluid 
    grid-list-md
    hide-overlay
    class="container-padding">

    <h2>Mensa Wolfenbüttel</h2>
    <span>Montag bis Freitag 11:15 - 14:15 Uhr</span>

    <v-divider class="divider"/>

    <v-layout 
      :wrap="$vuetify.breakpoint.smAndDown"
      row>
      <v-flex
        v-for="dayPlan in weekPlan"
        :key="dayPlan.date"
        xs12>
        <v-card 
          height="100%">
          <v-card-title> 
            <h3>{{ getDayHeader(dayPlan) }}</h3>
          </v-card-title>
          <v-divider/>
          <v-list 
            v-for="item in dayPlan.data"
            :key="item.id"
            dense>
            <div class="list-tile">
              <span class="category">{{ item.category }}:</span>
              <v-icon
                v-if="displayIcon(item)"
                :color="getIconColor(item)"
                class="icon"
                small>
                mdi-leaf
              </v-icon>
              <br>
              <span>{{ item.name }}</span>
              <br>
              <span class="price">Studenten: {{ getPriceLabel(item.prices.students) }} - Angestellte: {{ getPriceLabel(item.prices.employees) }}</span>
            </div>
          </v-list>
        </v-card>
      </v-flex>
    </v-layout> 
    <span class="disclaimer">
      <span>
        Vegetarisch
        <v-icon
          :color="getIconColor()"
          small>
          mdi-leaf
        </v-icon>
      </span>
      &nbsp;&nbsp;
      <span>
        Vegan
        <v-icon
          color="green"
          small>
          mdi-leaf
        </v-icon>
      </span>
      &nbsp;&nbsp;
      <span>
        Quelle: openmensa.org
      </span>
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
      isDark: (state) => state.theme.isDark,
    }),
  },
  mounted() {
    if (this.lazyLoad) {
      // static build -> no mensa plan is in the store
      this.loadWeek();
    }
  },
  methods: {
    ...mapActions({
      loadWeek: 'mensa/loadWeek',
    }),
    getDayHeader(dayPlan) {
      const day = moment(dayPlan.date.toString());
      return (day.isSame(moment(), 'day')? 'Heute' : day.format('dddd')) + " - " + day.format('DD.MM.YYYY');
    },
    getPriceLabel(price) {
      const euros = Math.floor(price);
      let cents = Math.round((price - euros) * 100);
      cents = cents != 0 ? cents : '00';
      return euros + ',' + cents + '€';
    },
    getIconColor(item) {
      if(item == undefined || item.notes.includes('vegetarisch')){
        return this.isDark? 'white' : 'black';
      }else if(item.notes.includes('vegan')){
        return 'green';
      }
    },
    displayIcon(item) {
      return item.notes.includes('vegetarisch') || item.notes.includes('vegan');
    },
  },
};
</script>


<style scoped lang="scss">

.icon{
  opacity: 0.7;
}

.list-tile{
  padding: 5px 0 5px 15px;
}

.category {
  font-weight: bold;
}

.price{
  font-size: 12px;
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