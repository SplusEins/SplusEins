<template>
  <v-card class="fill-height">
    <v-card-title>
      <span class="text-h5">Statistik</span>
    </v-card-title>
    <vc-donut
      :sections="sections"
      :size="230"
      :thickness="30"
      :background="this.$vuetify.theme.dark ? '#1E1E1E' : 'white'"
      :total="totalHours"
      unit="px"
    >
      <h1>{{ sections.length != 0 ? totalHours.toLocaleString() : 0 }}h</h1>diese Woche
    </vc-donut>
    <v-card-text class="card-text">
      <h3>{{ subscribedTimetable.description || subscribedTimetable.label }}</h3>
      <span>{{ sections.length }} {{ sections.length > 1 ? 'Module' : 'Modul' }} an </span>
      <span>{{ totalWeekdays }} {{ totalWeekdays > 1 ? 'Wochentagen' : 'Wochentag' }}</span>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'StatsCard',
  data () {
    return {
      dialogOpen: false,
      totalHours: 1,
      totalWeekdays: 0,
      sections: []
    };
  },
  computed: {
    ...mapState({
      upcomingEvents: (state) => state.splus.upcomingEvents,
      subscribedTimetable: (state) => state.splus.subscribedTimetable
    })
  },
  watch: {
    upcomingEvents: 'updateSections'
  },
  mounted () {
    this.updateSections();
  },
  methods: {
    updateSections () {
      const uniqueEvents = new Map();
      const weekdays = [];
      let totalHoursCalc = 0;
      this.sections = [];

      this.upcomingEvents.forEach(element => {
        if (uniqueEvents.has(element.title)) {
          uniqueEvents.set(element.title, uniqueEvents.get(element.title) + element.duration)
        } else {
          uniqueEvents.set(element.title, element.duration)
        }
        if (!weekdays.includes(this.$dayjs(element.start).day())) weekdays.push(this.$dayjs(element.start).day())
      });

      this.totalWeekdays = weekdays.length;

      uniqueEvents.forEach((value) => {
        totalHoursCalc += value
      });

      this.totalHours = totalHoursCalc > 0 ? totalHoursCalc : 1;

      uniqueEvents.forEach((value, key) => {
        this.sections.push({ label: key + ' - ' + value.toLocaleString() + ' Stunden', value });
      });
    }
  }
};
</script>

<style lang="scss">

.card-text{
  text-align: center;
}

</style>
