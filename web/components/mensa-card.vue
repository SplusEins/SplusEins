<template>
  <v-card class="fill-height">
    <v-card-title>
      <div class="text-h5">
        Mensa Wolfenbüttel {{ isPlanOfToday? 'Heute' : 'Morgen' }}
      </div>
    </v-card-title>
    <v-card-text class="card-text-padding">
      <v-list
        v-for="item in mensaMenus"
        :key="item.id"
        dense
      >
        <div class="list-tile">
          <b>{{ item.category }}:</b>
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
        @click="$track('MensaPlan', 'opened', 'dashboard')"
      >
        Mehr
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';

export default {
  name: 'MensaCard',
  computed: {
    mensaMenus () {
      if (this.plans.length == 0) {
        return [];
      }

      return Object.values(this.getNextAvailablePlan.data)
        .filter(({ category }) => category.startsWith('Essen '));
    },
    isPlanOfToday () {
      return this.$dayjs().isSame(this.getNextAvailablePlan.date, 'day');
    },
    ...mapState({
      lazyLoad: (state) => state.lazyLoad,
      plans: (state) => state.mensa.plans
    }),
    ...mapGetters({
      getNextAvailablePlan: 'mensa/getNextAvailablePlan'
    })
  },
  mounted () {
    if (this.lazyLoad) {
      // static build -> no mensa plan is in the store
      this.load();
    }
  },
  methods: {
    ...mapActions({
      load: 'mensa/load'
    })
  }
};
</script>

<style lang="scss">

.list-tile{
  padding: 5px 0 5px 0px;
}

</style>
