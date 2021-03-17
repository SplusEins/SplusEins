<template>
  <v-list>
    <v-list-item
      to="/"
      nuxt
      @click="$track('Menu', 'goToHomepage', 'sideMenu')"
    >
      <v-list-item-action>
        <v-icon>mdi-home</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>
          Startseite
        </v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <v-list-item @click="customTimetableDialogOpen = true; $track('CustomTimeTableDialog', 'opened', 'sideMenu')">
      <v-list-item-action>
        <v-icon>mdi-plus</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>
          Personalisierter Plan
        </v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <v-list-item
      to="/mensa"
      nuxt
      @click="$track('MensaPlan', 'opened', 'sideMenu')"
    >
      <v-list-item-action>
        <v-icon>mdi-food-fork-drink</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>
          Mensa Wolfenbüttel
        </v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <v-list-item
      to="/bus"
      nuxt
      @click="$track('BusPlan', 'opened', 'sideMenu')"
    >
      <v-list-item-action>
        <v-icon>mdi-bus</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>
          Busse Wolfenbüttel
        </v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <custom-timetable-dialog v-model="customTimetableDialogOpen" />
  </v-list>
</template>

<script>
import CustomTimetableDialog from './custom-timetable-dialog.vue';

export default {
  components: {
    CustomTimetableDialog
  },
  data () {
    return {
      customTimetableDialogOpen: false
    };
  }
};
</script>
