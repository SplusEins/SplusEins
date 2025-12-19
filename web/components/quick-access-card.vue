<template>
  <v-card class="fill-height">
    <v-card-title>
      <div class="text-h5">Schnellzugriff</div>
    </v-card-title>
    <v-card-text class="text-body-1">
      <v-list v-if="customSchedulesAsRoutes.length != 0">
        <v-list-item
          v-for="route in customSchedulesAsRoutes"
          :key="route.query.name"
          :to="route"
          text
          nuxt
        >
          {{ route.query.name }}
        </v-list-item>
      </v-list>
      <v-divider v-if="displayDivider" />
      <v-list v-if="favorites.length != 0">
        <v-list-item
          v-for="favorite in favorites"
          :key="favorite.id"
          :to="favorite.route"
          text
          nuxt
        >
          {{ favorite.description }}
        </v-list-item>
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
      favorites: (state) => state.splus.favoriteSchedules,
    }),
    ...mapGetters({
      customSchedulesAsRoutes: 'splus/customTimetablesAsRoutes',
    }),
    displayDivider() {
      return (
        this.favorites.length != 0 && this.customSchedulesAsRoutes.length != 0
      );
    },
  },
};
</script>

<style scoped lang="scss"></style>
