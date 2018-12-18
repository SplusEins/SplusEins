<template>
  <v-card>
    <v-card-title primary-title>
      <div>
        <div class="headline">Favoriten</div>
        <ul>
          <v-btn
            v-for="route in customSchedulesAsRoutes"
            :key="route.query.name"
            :to="route"
            flat
            nuxt>
            {{ route.query.name }}
          </v-btn>
          <v-btn
            v-for="favorite in favorites"
            :key="favorite.id"
            :to="favorite.route"
            flat
            nuxt>
            {{ favorite.description }}
          </v-btn>
        </ul>
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
  },
};
</script>
