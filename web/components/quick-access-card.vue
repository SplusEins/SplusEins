<template>
  <v-card>
    <v-card-title>
      <div class="text-h5">
        Schnellzugriff
      </div>
    </v-card-title>
    <v-card-text class="card-text-padding">
      <v-list v-if="customSchedulesAsRoutes.length != 0">
        <v-list-tile
          v-for="route in customSchedulesAsRoutes"
          :key="route.query.name"
          :to="route"
          flat
          nuxt
          @click="$track('Calendar', 'dashboard plan used', 'custom')"
        >
          {{ route.query.name }}
        </v-list-tile>
      </v-list>
      <v-divider v-if="displayDivider" />
      <v-list v-if="favorites.length != 0">
        <v-list-tile
          v-for="favorite in favorites"
          :key="favorite.id"
          :to="favorite.route"
          flat
          nuxt
          @click="$track('Calendar', 'dashboard plan used', 'favorite')"
        >
          {{ favorite.description }}
        </v-list-tile>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

export default {
  name: 'QuickAccessCard',
  computed: {
    ...mapState({
      favorites: (state) => state.splus.favoriteSchedules
    }),
    ...mapGetters({
      customSchedulesAsRoutes: 'splus/customTimetablesAsRoutes'
    }),
    displayDivider () {
      return this.favorites.length != 0 && this.customSchedulesAsRoutes.length != 0;
    }
  }
};
</script>

<style lang="scss">

.card-text-padding{
  padding-top: 0px;
}

</style>
