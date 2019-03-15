<template>
  <v-card>
    <v-card-title>
      <div class="headline">
        Mensa Wolfenbüttel Heute
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
        flat
        color="primary"
        @click="$track('MensaPlan', 'opened', 'dashboard')"
      >
        Mehr
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapState, mapActions } from 'vuex';

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
      lazyLoad: (state) => state.lazyLoad,
      weekPlan: (state) => state.mensa.weekPlan,
    }),
  },
  mounted() {
    if (this.lazyLoad) {
      // static build -> no mensa plan is in the store
      this.loadMensaWeek();
    }
  },
  methods: {
    ...mapActions({
      loadMensaWeek: 'mensa/loadWeek',
    }),
  },
};
</script>

<style lang="scss">

.list-tile{
  padding: 5px 0 5px 0px;
}

.card-text-padding{
  padding-top: 0px;
}

</style>
