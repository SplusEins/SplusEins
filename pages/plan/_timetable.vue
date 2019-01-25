<template>
  <v-container
    fluid
    fill-height>
    <spluseins-calendar />
  </v-container>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import SpluseinsCalendar from '../../components/spluseins-calendar.vue';

export default {
  name: 'TimetablePage',
  head() {
    return {
      title: 'Personalisierter Plan',
    };
  },
  components: {
    SpluseinsCalendar,
  },
  computed: {
    ...mapGetters({
      isCustomSchedule: 'splus/isCustomSchedule',
    }),
  },
  async fetch({ store, params, query }) {
    store.dispatch('splus/importSchedule', { params, query });

    if (process.static) {
      store.commit('enableLazyLoad');
      store.commit('splus/resetWeek', true);
    } else {
      store.commit('splus/resetWeek', false);
    }

    if (process.client || !store.state.lazyLoad) {
      await store.dispatch('splus/load');
    } else {
      console.log('lazy loading is enabled: not fetching any lectures');
    }
  },
  watchQuery: ['id', 'name', 'course'], // rerender page when query params change
};
</script>
