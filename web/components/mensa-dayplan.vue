<template>
  <v-card
    class="fill-height"
    outlined
    elevation="1"
  >
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
          <v-tooltip
            bottom
            v-for="icon in getIcons(item)"
            :key="icon.text"
          >
            <template #activator="{ on }">
              <span v-on="on">
                <v-icon
                  :color="icon.color"
                  class="icon ml-1 align-self-center"
                  small
                >
                  {{ icon.icon }}
                </v-icon>
              </span>
            </template>
            <span>{{ icon.text }}</span>
          </v-tooltip>
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
import { mdiSprout, mdiCurrencyEur, mdiPig, mdiCarrot, mdiAlertDecagramOutline, mdiNewBox, mdiCow, mdiInformationBoxOutline, mdiTurkey, mdiHomeSiloOutline, mdiFish, mdiSheep, mdiEarth } from '@mdi/js'

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
      mdiSprout,
      mdiCurrencyEur,
      mdiPig,
      mdiCarrot,
      mdiAlertDecagramOutline,
      mdiNewBox,
      mdiCow,
      mdiInformationBoxOutline,
      mdiTurkey,
      mdiHomeSiloOutline,
      mdiFish,
      mdiSheep,
      mdiEarth
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
    getIcons (item) {
      const icons = [];
      item.categories.forEach(e => {
        let icon = mdiInformationBoxOutline;
        let color = this.$vuetify.theme.dark ? 'white' : 'black';
        switch (e) {
          case 'Schwein':
            icon = mdiPig;
            break;
          case 'Rind':
            icon = mdiCow;
            break;
          case 'Geflügel':
            icon = mdiTurkey;
            break;
          case 'Fisch':
            icon = mdiFish;
            break;
          case 'Lamm':
            icon = mdiSheep;
            break;
          case 'Artgerechte Tierhaltung':
            icon = mdiHomeSiloOutline;
            break;
          case 'Aktion':
            icon = mdiAlertDecagramOutline;
            color = 'purple';
            break;
          case 'NEU bei uns':
            icon = mdiNewBox;
            color = 'blue';
            break;
          case 'Vegan':
            icon = mdiSprout;
            color = 'green';
            break;
          case 'Vegetarisch':
            icon = mdiCarrot;
            color = 'orange';
            break;
          case 'StudiDeal':
            icon = mdiCurrencyEur;
            color = 'red';
            break;
          case 'Klimaessen':
            icon = mdiEarth;
            color = 'blue';
            break;
        }
        icons.push({
          icon,
          color,
          text: e
        });
      });
      return icons;
    }
  }
}
</script>

<style lang="scss" scoped>
.icon{
  opacity: 0.7;
}
</style>
