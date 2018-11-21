<template lang="html">

  <v-list subheader>

    <v-subheader>
      Eigene Pläne
    </v-subheader>

    <v-list-tile
      v-for="route in customTimetablesAsRoutes"
      :key="route.params.timetable"
      :to="route"
      nuxt>
      <v-list-tile-content>
        <v-list-tile-title>{{ route.params.timetable }}</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>

    <v-list-tile
      @click="customTimetableDialogOpen = true">
      <v-list-tile-action>
        <v-icon>add</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-title>Plan erstellen</v-list-tile-title>
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
    ...mapState({
      customTimetable: (state) => state.splus.customTimetable,
    }),
    ...mapGetters({
      customTimetablesAsRoutes: 'splus/customTimetablesAsRoutes',
    }),
  },
};
</script>
