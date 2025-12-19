<template>
  <v-sheet class="fill-height">
    <spluseins-calendar />
  </v-sheet>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import SpluseinsCalendar from '../../components/spluseins-calendar.vue';

export default {
  name: 'TimetablePage',
  head() {
    return {
      title: this.isCustomSchedule
        ? 'Stundenplan'
        : this.schedule.longDescription,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.isCustomSchedule
            ? 'Stundenplan'
            : this.schedule.longDescription,
        },
        {
          hid: 'og:description',
          property: 'og:description',
          content: this.isCustomSchedule
            ? 'Stundenplan'
            : this.schedule.longDescription,
        },
      ],
    };
  },
  components: {
    SpluseinsCalendar,
  },
  computed: {
    ...mapGetters({
      isCustomSchedule: 'splus/isCustomTimetable',
    }),
    ...mapState({
      schedule: (state) => state.splus.schedule,
    }),
  },
  async fetch({ store, params, query, error }) {
    store.dispatch('splus/importSchedule', { params, query });
    store.commit('splus/resetWeek', process.static);

    if (store.state.splus.schedule == undefined) {
      error({
        statusCode: 404,
        message: 'Not found',
        response: { data: 'Dieser Plan existiert nicht (mehr)' },
      });
      return;
    }

    await store.dispatch('splus/load');
  },
  middleware: 'cached',
  watchQuery: ['id', 'name', 'course'], // rerender page when query params change
  key: (to) => to.fullPath, // rerender full path
};
</script>
