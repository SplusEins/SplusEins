<template>
  <v-app id="inspire">
    <v-navigation-drawer 
      v-model="drawer"
      fixed
      app
    >
      <v-list dense>
        <v-list-tile>
          <v-list-tile-action>
            <v-icon>home</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Meine Stundenpläne</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile>
          <v-list-tile-action>
            <v-icon>contact_mail</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Meine F<avoriten</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile>
          <v-list-tile-action>
            <v-icon>contact_mail</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Alle Stundenpläne</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar 
      color="indigo" 
      dark 
      fixed 
      app>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"/>
      <v-toolbar-title>SPLUSEINS</v-toolbar-title>
    </v-toolbar>
    <v-content>
      <calendar-component/>
    </v-content>
    <v-footer 
      color="indigo"
      app>
      <span class="white--text">&copy; 2017</span>
    </v-footer>
  </v-app>
</template>

<script>
import AboutText from '~/components/AboutText.vue';
import CalendarComponent from '../components/calendar-component/calendar.vue'

export default {
  name: 'HomePage',
  layout: 'empty',
  components: {
    AboutText,
    CalendarComponent,
  },
  data() {
    return {
      drawer: null
    }
  },
  computed: {
  },
  methods: {
  }
};
</script>

<style lang="scss">
</style>
