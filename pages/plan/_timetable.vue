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
    store.commit('splus/resetWeek', process.static);

    if (store.state.splus.schedule == undefined) {
      error({ statusCode: 404, message: 'Plan existiert nicht' });
      return;
    }

    if (!store.state.lazyLoad) {
      await store.dispatch('splus/load');
    }
  },
  middleware: 'cached',
  watchQuery: ['id', 'name', 'course'], // rerender page when query params change
};
</script>
