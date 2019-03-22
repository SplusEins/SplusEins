<template>
  <v-container
    fluid
    fill-height
  >
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
      title: this.isCustomSchedule ? 'Stundenplan' : this.schedule.longDescription,
      meta: [
        { hid: 'description', name: 'description', content: this.isCustomSchedule ? 'Stundenplan' : this.schedule.longDescription },
        { hid: 'og:description', property: 'og:description', content: this.isCustomSchedule ? 'Stundenplan' : this.schedule.longDescription },
      ],
    };
  },
  components: {
    SpluseinsCalendar,
  },
  computed: {
    ...mapGetters({
      isCustomSchedule: 'splus/isCustomSchedule',
    }),
    ...mapState({
      schedule: (state) => state.splus.schedule,
    })
  },
  async fetch({ store, params, query, error }) {
    store.dispatch('splus/importSchedule', { params, query });

    if (process.static) {
      store.commit('enableLazyLoad');
      store.commit('splus/resetWeek', true);
    } else {
      store.commit('splus/resetWeek', false);
    }

    if (store.state.splus.schedule == undefined) {
      error({ statusCode: 404, message: 'Plan existiert nicht' });
      return;
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
