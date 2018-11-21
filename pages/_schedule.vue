<template>
  <v-container
    fluid
    fill-height>
    <spluseins-calendar />
  </v-container>
</template>

<script>
import SpluseinsCalendar from '../components/spluseins-calendar.vue';

export default {
  name: 'SchedulePage',
  components: {
    SpluseinsCalendar,
  },
  async fetch({ store, params, query }) {
    store.dispatch('splus/importSchedule', { params, query });

    if (process.static) {
      store.commit('splus/enableLazyLoad');
    }

    if (!store.state.splus.lazyLoad) {
      await store.dispatch('splus/load');
    } else {
      console.log('lazy loading is enabled: not fetching any lectures');
    }
  },
  watchQuery: ['id', 'course'], // rerender page when query params change
};
</script>
