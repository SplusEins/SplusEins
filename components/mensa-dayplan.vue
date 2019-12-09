<template>
  <v-flex xs12>
    <v-card height="100%">
      <v-card-title>
        <h3>{{ getDayHeader(plan) }}</h3>
      </v-card-title>
      <v-divider />
      <v-list
        v-for="item in plan.data"
        :key="item.id"
        dense
      >
        <div class="list-tile">
          <span class="category">{{ item.category }}:</span>
          <v-icon
            v-if="displayIcon(item)"
            :color="getIconColor(item)"
            class="icon"
            small
          >
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
</template>

<script>
import * as moment from 'moment';
import { mapState } from 'vuex';

export default {
  name: "MensaDayplanComponent",
  props: {
    plan: {
      type: Object,
      default: () => {}
    },
  },
  computed: {
    ...mapState({
      isDark: (state) => state.ui.isDark
    })
  },
  methods: {
    getDayHeader(dayPlan) {
      const day = moment(dayPlan.date.toString());
      return (day.isSame(moment(), 'day')? 'Heute' : day.format('dddd')) + " - " + day.format('DD.MM.YYYY');
    },
    getPriceLabel(price) {
      const euros = Math.floor(price);
      let cents = Math.round((price - euros) * 100);
      cents = cents >= 10 ? cents : '0' + cents;
      return euros + ',' + cents + '€';
    },
    getIconColor(item) {
      if(item == undefined || item.notes.includes('Vegetarisch')){
        return this.isDark? 'white' : 'black';
      }else if(item.notes.includes('Vegan')){
        return 'green';
      }
    },
    displayIcon(item) {
      return item.notes.includes('Vegetarisch') || item.notes.includes('Vegan');
    },
  },
}
</script>

<style lang="scss" scoped>
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

.icon{
  opacity: 0.7;
}
</style>
