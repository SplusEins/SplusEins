<template>
  <v-card>
    <v-card-title primary-title>
      <div>
        <div class="headline">Mensa Wolfenbüttel Heute</div>
        <ul>
          <li
            v-for="menu in mensaMenus"
            :key="menu.id">
            {{ menu.name }}
          </li>
        </ul>
      </div>
    </v-card-title>
    <v-card-actions>
      <v-spacer />
      <v-btn
        to="/mensa"
        flat
        nuxt>
        Öffnen
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'MensaCard',
  computed: {
    mensaMenus() {
      if (this.weekPlan.length == 0) {
        return [];
      }

      return Object.values(this.weekPlan[0].data)
        .filter(({ category }) => category.startsWith('Essen '));
    },
    ...mapState({
      weekPlan: (state) => state.mensa.weekPlan,
    }),
  },
};
</script>
