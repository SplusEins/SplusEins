<template>
  <v-card class="fill-height mensa-day-card" outlined elevation="1">
    <v-card-title class="justify-space-between align-center flex-wrap">
      <span class="text-h6">{{ getDayHeader(plan) }}</span>
      <div class="legend d-flex align-center">
        <div class="legend-item d-flex align-center mr-3">
          <v-icon color="green" small class="mr-1">{{ mdiLeaf }}</v-icon>
          Vegan
        </div>
        <div class="legend-item d-flex align-center mr-3">
          <v-icon color="green" small class="mr-1">{{ mdiCarrot }}</v-icon>
          Vegetarisch
        </div>
        <div class="legend-item d-flex align-center">
          <v-icon color="red" small class="mr-1">{{ mdiFood }}</v-icon>
          Menü
        </div>
      </div>
    </v-card-title>
    <v-divider />
    <v-card-text class="py-1">
      <div v-for="(groupItems, groupName) in groupedMeals" :key="groupName" class="mb-4">
        <div class="group-header text-subtitle-2 mb-2">{{ groupName }}</div>
        <div class="meal-grid">
          <div class="meal-card" v-for="item in groupItems" :key="item.id">
            <div class="meal-title d-flex align-center justify-space-between">
              <span class="name mr-2">{{ item.name }}</span>
              <v-chip small outlined class="lane-chip hidden-sm-and-down">{{ item.lane }}</v-chip>
            </div>
            <div class="meal-icons d-flex align-center flex-wrap mt-1">
              <v-tooltip bottom v-for="icon in getIcons(item)" :key="icon.text">
                <template #activator="{ on }">
                  <span v-on="on">
                    <v-icon :color="icon.color" class="icon ml-1 align-self-center" small>
                      {{ icon.icon }}
                    </v-icon>
                  </span>
                </template>
                <span>{{ icon.text }}</span>
              </v-tooltip>
            </div>
            <div class="prices text-caption text--secondary mt-1">
              Studenten: {{ getPriceLabel(item.price.student) }} • Angestellte: {{ getPriceLabel(item.price.employee) }}
            </div>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import { mdiLeaf, mdiFood, mdiPig, mdiCarrot, mdiAlertDecagramOutline, mdiNewBox, mdiCow, mdiInformationBoxOutline, mdiTurkey, mdiHomeSiloOutline, mdiFish, mdiSheep, mdiTree } from '@mdi/js';

export default {
  name: 'MensaDayplanComponent',
  props: {
    plan: {
      type: Object,
      default: () => {}
    },
    groupBy: {
      type: String,
      default: 'lane' // 'lane' | 'meat'
    }
  },
  data () {
    return {
      mdiLeaf,
      mdiFood,
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
      mdiTree
    };
  },
  computed: {
    groupedMeals () {
      if (!this.plan || !this.plan.meals) return {};
      if (this.groupBy === 'lane') {
        return this.groupByLane(this.plan.meals);
      } else {
        return this.groupByMeat(this.plan.meals);
      }
    }
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
            icon = mdiLeaf;
            color = 'green';
            break;
          case 'Vegetarisch':
            icon = mdiCarrot;
            color = 'green';
            break;
          case 'StudiDeal':
            icon = mdiFood;
            color = 'red';
            break;
          case 'Klimaessen':
            icon = mdiTree;
            color = 'teal';
            break;
        }
        icons.push({
          icon,
          color,
          text: e
        });
      });
      return icons;
    },
    groupByLane (meals) {
      const groups = {};
      meals.forEach(m => {
        // Normalize lane: collect "Essen x" under "Essen", otherwise keep exact lane (e.g., "Beilage", "Dessert")
        let key = m.lane || 'Sonstiges';
        if (key.toLowerCase().startsWith('essen')) key = 'Essen';
        if (!groups[key]) groups[key] = [];
        groups[key].push(m);
      });
      // Sort groups in a friendly order
      const order = ['Essen', 'Beilage', 'Dessert'];
      return Object.keys(groups)
        .sort((a, b) => (order.indexOf(a) === -1 ? 999 : order.indexOf(a)) - (order.indexOf(b) === -1 ? 999 : order.indexOf(b)) || a.localeCompare(b))
        .reduce((acc, k) => { acc[k] = groups[k]; return acc; }, {});
    },
    groupByMeat (meals) {
      const groups = {};
      const meatOrder = ['Vegan', 'Vegetarisch', 'Rind', 'Geflügel', 'Schwein', 'Lamm', 'Fisch', 'Artgerechte Tierhaltung', 'Niedersachsen Menü', 'Aktion', 'NEU bei uns', 'Sonstiges'];
      const laneOrder = ['Essen', 'Beilage', 'Dessert', 'Sonstiges'];
      const classifyMeat = (m) => {
        const cats = m.categories || [];
        for (const label of meatOrder) {
          if (cats.includes(label)) return label;
        }
        return 'Sonstiges';
      };
      const normalizeLane = (lane) => {
        let key = lane || 'Sonstiges';
        if (key.toLowerCase().startsWith('essen')) key = 'Essen';
        return key;
      };
      meals.forEach(m => {
        const meat = classifyMeat(m);
        const lane = normalizeLane(m.lane);
        const key = `${meat} — ${lane}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(m);
      });
      // Build ordered object: iterate meats, then lanes
      const ordered = {};
      meatOrder.forEach(meat => {
        // collect existing lanes for this meat
        const lanesForMeat = Object.keys(groups)
          .filter(k => k.startsWith(`${meat} — `))
          .map(k => k.split(' — ')[1]);
        // unique lanes
        const uniqueLanes = Array.from(new Set(lanesForMeat));
        // sort lanes by laneOrder priority then alpha
        uniqueLanes.sort((a, b) => (laneOrder.indexOf(a) === -1 ? 999 : laneOrder.indexOf(a)) - (laneOrder.indexOf(b) === -1 ? 999 : laneOrder.indexOf(b)) || a.localeCompare(b));
        uniqueLanes.forEach(lane => {
          const k = `${meat} — ${lane}`;
          if (groups[k] && groups[k].length) ordered[k] = groups[k];
        });
      });
      return ordered;
    }
  }
}
</script>

<style lang="scss" scoped>
.icon{ opacity: 0.7; }
.group-header { font-weight: 600; opacity: 0.9; }
.legend { font-size: 0.85rem; }
.legend .v-icon { opacity: 0.8; }
.mensa-day-card { overflow: hidden; }

/* Responsive grid for meals to use horizontal space */
.meal-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 10px 16px;
}

@media (min-width: 900px) {
  .meal-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 1264px) {
  .meal-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

.meal-card {
  border: 1px dashed rgba(0,0,0,0.12);
  border-radius: 8px;
  padding: 10px 12px;
}
.meal-title .name { font-weight: 600; }
.lane-chip { opacity: 0.8; }
</style>
