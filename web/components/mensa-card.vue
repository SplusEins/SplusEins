<template>
  <v-card class="fill-height mensa-card">
    <v-card-title>
      <div class="text-h5">
        Mensa Wolfenbüttel {{ isPlanOfToday? 'Heute' : 'Morgen' }}
      </div>
    </v-card-title>
    <v-card-text>
      <v-list
        v-for="item in mensaMenus"
        :key="item.id"
        dense
      >
        <div>
          <b>{{ item.lane }}:</b>
          <br>
          <span>{{ item.name }}</span>
          <br>
        </div>
      </v-list>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn
        nuxt
        to="/mensa"
        text
        color="primary"
      >
        Mehr
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'MensaCard',
  computed: {
    mensaMenus () {
      return Object.values(this.getNextAvailablePlan.meals)
        .filter(({ lane }) => lane.startsWith('Essen '));
    },
    isPlanOfToday () {
      return this.$dayjs().isSame(this.getNextAvailablePlan.date, 'day');
    },
    ...mapGetters({
      getNextAvailablePlan: 'mensa/getNextAvailablePlan'
    })
  },
  mounted () {
    this.load();
  },
  methods: {
    ...mapActions({
      load: 'mensa/load'
    })
  }
};
</script>
