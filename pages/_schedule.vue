<template>
  <v-container
    fluid
    fill-height>
    <spluseins-calendar />
  </v-container>
</template>

<script>
import { mapState } from 'vuex';
import SpluseinsCalendar from '../components/spluseins-calendar.vue';

export default {
  name: 'SchedulePage',
  head() {
    return {
      title: this.currentSchedule.label,
    };
  },
  components: {
    SpluseinsCalendar,
  },
  computed: {
    ...mapState({
      currentSchedule: (state) => state.splus.schedule,
    })
  },
  async fetch({ store, params, query }) {
    store.dispatch('splus/importSchedule', { params, query });

    if (process.static) {
      store.commit('splus/enableLazyLoad');
    }

    if (process.client || !store.state.splus.lazyLoad) {
      await store.dispatch('splus/load');
    } else {
      console.log('lazy loading is enabled: not fetching any lectures');
    }
  },
  watchQuery: ['id', 'course'], // rerender page when query params change
};
</script>
