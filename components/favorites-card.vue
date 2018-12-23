<template>
  <v-card>
    <v-card-title primary-title>
      <div>
        <div class="headline">Favoriten</div>
        <v-list>
          <v-list-tile
            v-for="route in customSchedulesAsRoutes"
            :key="route.query.name"
            :to="route"
            flat
            nuxt>
            {{ route.query.name }}
          </v-list-tile>
        </v-list>
        <v-divider v-if="display" />
        <v-list>
          <v-list-tile
            v-for="favorite in favorites"
            :key="favorite.id"
            :to="favorite.route"
            flat
            nuxt>
            {{ favorite.description }}
          </v-list-tile>
        </v-list>
      </div>
    </v-card-title>
  </v-card>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { customTimetableToRoute } from '../store/splus';

export default {
  name: 'FavoritesCard',
  data() {
    return {
      customTimetableToRoute,
    };
  },
  computed: {
    ...mapState({
      favorites: (state) => state.splus.favoriteSchedules,
    }),
    ...mapGetters({
      customSchedulesAsRoutes: 'splus/customSchedulesAsRoutes',
    }),
    displayDivider() {
      return this.favorites.length != 0 && this.customSchedulesAsRoutes.length != 0;
    }
  },
};
</script>
