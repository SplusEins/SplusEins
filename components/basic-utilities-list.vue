<template>
  <v-list>
    
    <v-list-tile
      to="/"
      nuxt
      @click="trackMatomoEvent('Menu','goToHomepage', 'sideMenu')">
      <v-list-tile-action>
        <v-icon>home</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-title>
          Startseite
        </v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>

    <v-list-tile @click="(customTimetableDialogOpen = true); trackMatomoEvent('Menu','openCustomTimeTableDialog')">
      <v-list-tile-action>
        <v-icon>add</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-title>
          Personalisierter Plan
        </v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>

    <custom-timetable-dialog v-model="customTimetableDialogOpen" />
  </v-list>
</template>

<script>
import CustomTimetableDialog from './custom-timetable-dialog.vue';
export default {
  components: {
    CustomTimetableDialog,
  },
  data() {
    return {
      customTimetableDialogOpen: false,
    };
  },
  methods:{
    trackMatomoEvent (category, action , name) {
      this.$matomo.trackEvent(category, action, name);
    }
  }
 };
</script>