<template>
  <v-list>
    
    <v-list-tile
      to="/"
      nuxt>
      <v-list-tile-action>
        <v-icon>home</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-title>
          Startseite
        </v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>

    <v-list-tile @click="customTimetableDialogOpen = true">
      <v-list-tile-action>
        <v-icon>add</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-title>
          Personalisierter Plan
        </v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>

    <v-list-tile @click="mensaPlanDialogOpen = true">
      <v-list-tile-action>
        <v-icon>fastfood</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-title>
          Mensa Wolfenbüttel
        </v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>

    <custom-timetable-dialog v-model="customTimetableDialogOpen" />
    <mensa-plan-dialog v-model="mensaPlanDialogOpen" />
  </v-list>
</template>

<script>
import CustomTimetableDialog from './custom-timetable-dialog.vue';
import MensaPlanDialog from './mensa-plan-dialog.vue';

export default {
  components: {
    CustomTimetableDialog,
    MensaPlanDialog,
  },
  data() {
    return {
      customTimetableDialogOpen: false,
      mensaPlanDialogOpen: false,
    };
  },
 };
</script>