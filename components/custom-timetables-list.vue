<template lang="html">

  <v-list :subheader="hasCustomTimetables">

    <v-subheader>
      Eigene Pläne
      <v-btn
        icon
        flat
        @click="customTimetableDialogOpen = true">
        <v-icon>add</v-icon>
      </v-btn>
    </v-subheader>

    <v-list-tile
      v-for="route in customSchedulesAsRoutes"
      :key="route.params.schedule"
      :to="route"
      nuxt>
      <v-list-tile-content>
        <v-list-tile-title>{{ route.params.schedule }}</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>

    <custom-timetable-dialog v-model="customTimetableDialogOpen" />
  </v-list>

</template>

<script lang="js">
import { mapState, mapGetters } from 'vuex';
import CustomTimetableDialog from './custom-timetable-dialog.vue';

export default {
  name: 'CustomTimetablesList',
  components: {
    CustomTimetableDialog,
  },
  data() {
    return {
      customTimetableDialogOpen: false,
    };
  },
  computed: {
    hasCustomTimetables() {
      return JSON.stringify(this.customSchedules) != '{}';
    },
    ...mapState({
      customSchedules: (state) => state.splus.customSchedules,
    }),
    ...mapGetters({
      customSchedulesAsRoutes: 'splus/customSchedulesAsRoutes',
    }),
  },
};
</script>
