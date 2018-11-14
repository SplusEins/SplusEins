<template lang="html">

  <v-list>

    <v-subheader>
      Eigene Pläne
    </v-subheader>

    <v-list-tile
      v-if="!!customSchedule"
      :to="customScheduleAsRoute"
      nuxt>
      <v-list-tile-content>
        <v-list-tile-title>{{ customSchedule.label }}</v-list-tile-title>
      </v-list-tile-content>
      <v-list-tile-action v-if="currentSchedule.label == customSchedule.label">
        <v-icon>check</v-icon>
      </v-list-tile-action>
    </v-list-tile>

    <v-list-tile
      v-else
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
      currentSchedule: (state) => state.splus.schedule,
    }),
    ...mapGetters({
      customScheduleAsRoute: 'splus/customScheduleAsRoute',
    }),
  },
};
</script>
