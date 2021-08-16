<template>
  <v-card class="fill-height">
    <v-card-title>
      <span class="text-h6">{{ getDayHeader(plan) }}</span>
    </v-card-title>
    <v-divider />
    <v-card-text class="py-1">
      <v-list
        v-for="item in plan.meals"
        :key="item.id"
        dense
      >
        <div class="d-flex">
          <div class="text-subtitle-1">
            {{ item.lane }}
          </div>
          <v-icon
            v-if="displayIcon(item)"
            :color="getIconColor(item)"
            class="icon ml-1 align-self-center"
            small
          >
            {{ mdiLeaf }}
          </v-icon>
        </div>
        <div>
          {{ item.name }}
        </div>
        <div class="text-caption text--secondary">
          Studenten: {{ getPriceLabel(item.price.student) }} - Angestellte: {{ getPriceLabel(item.price.employee) }}
        </div>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script>
import { mdiLeaf } from '@mdi/js'

export default {
  name: 'MensaDayplanComponent',
  props: {
    plan: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      mdiLeaf
    };
  },
  methods: {
    getDayHeader (dayPlan) {
      const day = this.$dayjs(dayPlan.date.toString());
      return (day.isSame(this.$dayjs(), 'day') ? 'Heute' : day.format('dddd')) + ' - ' + day.format('DD.MM.YYYY');
    },
    getPriceLabel (price) {
      const euros = Math.floor(price);
      let cents = Math.round((price - euros) * 100);
      cents = cents >= 10 ? cents : '0' + cents;
      return euros + ',' + cents + '€';
    },
    getIconColor (item) {
      if (item.categories.includes('Vegetarisch')) {
        return this.$vuetify.theme.dark ? 'white' : 'black';
      } else if (item.categories.includes('Vegan')) {
        return 'green';
      }
    },
    displayIcon (item) {
      return this.getIconColor(item) != null
    }
  }
}
</script>

<style lang="scss" scoped>
.icon{
  opacity: 0.7;
}
</style>
