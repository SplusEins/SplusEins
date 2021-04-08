<template>
  <v-list>
    <v-list-item
      to="/"
      nuxt
      @click="$track('Menu', 'goToHomepage', 'sideMenu')"
    >
      <v-list-item-action>
        <v-icon>{{ mdiHome }}</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>
          Startseite
        </v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <v-list-item @click="customTimetableDialogOpen = true; $track('CustomTimeTableDialog', 'opened', 'sideMenu')">
      <v-list-item-action>
        <v-icon>{{ mdiPlus }}</v-icon>
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
        <v-icon>{{ mdiFoodForkDrink }}</v-icon>
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
        <v-icon>{{ mdiBus }}</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>
          Busse Wolfenbüttel
        </v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <lazy-custom-timetable-dialog v-model="customTimetableDialogOpen" />
  </v-list>
</template>

<script>
import { mdiHome, mdiPlus, mdiFoodForkDrink, mdiBus } from '@mdi/js'

export default {
  data () {
    return {
      customTimetableDialogOpen: false,
      mdiHome,
      mdiPlus,
      mdiFoodForkDrink,
      mdiBus
    };
  }
};
</script>
