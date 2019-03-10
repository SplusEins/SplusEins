<template>
  <v-card>
    <v-card-title>
      <span class="headline">Statistik</span>
    </v-card-title>
    <vc-donut 
      :sections="sections"
      :size="250"
      :thickness="30"
      :background="isDark ? '#424242' : 'white'"
      unit="px">
      <h1>{{ totalHours }}h</h1>pro Woche
    </vc-donut>
    <v-card-text class="card-text">
      <h3>{{ subscribedTimetable.description || subscribedTimetable.label }}</h3>
      <div>{{ sections.length }} Module</div>
    </v-card-text> 
  </v-card>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

export default {
  name: 'StatsCard',
  data() {
      return {
        dialogOpen: false,
        totalHours: 0,
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
  methods: {
    updateSections() {
       let uniqueLectures = new Map();
       this.sections = [];
       this.totalHours = 0;

       this.upcomingLectures.forEach(element => {
         if(uniqueLectures.has(element.title)){
           uniqueLectures.set(element.title, uniqueLectures.get(element.title) + element.duration)
         } else {
           uniqueLectures.set(element.title, element.duration)
         }
       });
       uniqueLectures.forEach((value) => {
          this.totalHours += value
       });
       uniqueLectures.forEach((value, key) => {
          this.sections.push({label: key + ' - ' + value + ' Stunden', value: value / this.totalHours *100});
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