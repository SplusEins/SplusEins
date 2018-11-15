<template lang="html">

  <v-list>

    <v-subheader>
      Eigene Pläne
    </v-subheader>

    <v-list-tile
      v-for="route in customSchedulesAsRoutes"
      :key="route.query.name"
      :to="route"
      nuxt>
      <v-list-tile-content>
        <v-list-tile-title>{{ route.query.name }}</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>

    <v-list-tile
      @click="customTimetableDialogOpen = true">
      <custom-timetable-dialog v-model="customTimetableDialogOpen" />
      <v-list-tile-action>
        <v-icon>add</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-title>Plan erstellen</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>

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
    ...mapState({
      customSchedule: (state) => state.splus.customSchedule,
    }),
    ...mapGetters({
      customSchedulesAsRoutes: 'splus/customSchedulesAsRoutes',
    }),
  },
};
</script>
