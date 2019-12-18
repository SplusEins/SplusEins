<template>
  <v-card>
    <v-card-title>
      <span class="headline">Statistik</span>
    </v-card-title>
    <vc-donut
      :sections="sections"
      :size="230"
      :thickness="30"
      :background="isDark ? '#424242' : 'white'"
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
import { mapState, mapGetters } from 'vuex';
import * as moment from 'moment';

export default {
  name: 'StatsCard',
  data() {
      return {
        dialogOpen: false,
        totalHours: 1,
        totalWeekdays: 0,
        sections: [],
      };
  },
  computed: {
    ...mapState({
      isDark: (state) => state.ui.isDark,
      upcomingLectures: (state) => state.splus.upcomingLectures,
      subscribedTimetable: (state) => state.splus.subscribedTimetable,
    }),
  },
  watch: {
    upcomingLectures() {
      this.updateSections();
    },
  },
  mounted() {
    this.updateSections();
  },
  methods: {
    updateSections() {
       let uniqueLectures = new Map();
       let weekdays = [];
       let totalHoursCalc = 0;
       this.sections = [];

       this.upcomingLectures.forEach(element => {
         if(uniqueLectures.has(element.title)){
           uniqueLectures.set(element.title, uniqueLectures.get(element.title) + element.duration)
         } else {
           uniqueLectures.set(element.title, element.duration)
         }
         if(!weekdays.includes(moment(element.start).day())) weekdays.push(moment(element.start).day())
       });

       this.totalWeekdays = weekdays.length;

       uniqueLectures.forEach((value) => {
          totalHoursCalc += value
       });

       this.totalHours = totalHoursCalc > 0 ? totalHoursCalc : 1;

       uniqueLectures.forEach((value, key) => {
          this.sections.push({label: key + ' - ' + value.toLocaleString() + ' Stunden', value: value});
       });
    },
  },
};
</script>

<style lang="scss">

.card-text{
  text-align: center;
  margin-top: 8px;
}

</style>
