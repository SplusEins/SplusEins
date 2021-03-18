<template>
  <v-calendar
    ref="calendar"
    :events="events"
    type="week"
    interval-width="40"
    locale="de"
    first-time="07:00"
    interval-count="13"
    interval-height="50"
  />
</template>

<script>
import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';

export default {
  name: 'SpluseinsCalendar',
  computed: {
    ...mapState({
      currentWeek: (state) => state.splus.week,
      lazyLoad: (state) => state.lazyLoad,
      schedule: (state) => state.splus.schedule
    }),
    ...mapGetters({
      events: 'splus/getCalendarEvents',
      weekOrDefault: 'splus/weekOrDefault'
    })
  },
  mounted () {
    // this.refresh();
  },
  methods: {
    ...mapMutations({
      setWeek: 'splus/setWeek',
      resetWeek: 'splus/resetWeek'
    }),
    ...mapActions({
      load: 'splus/load'
    })
  }
};
</script>
