<template>
  <v-dialog
    v-model="dialogOpen"
    width="500"
  >
    <v-card>
      <v-card-title
        class="text-h5 white--text primary px-4"
      >
        SplusEins
      </v-card-title>
      <v-card-text class="px-4 pt-2 pb-0">
        <p>
          Ein inoffizieller Stundenplan von Studenten für Studenten der Ostfalia.
        </p>
        <p>
          Hilfe zu SplusEins findest du in der <a href="https://spluseins.de/docs/benutzer.html#erste-schritte">Benutzerdokumentation</a>.
          Solltest du trotzdem Probleme haben, schreib uns doch gerne per Mail: team(at)spluseins(punkt)de.
        </p>
        <p>
          Der <a href="https://github.com/SplusEins/SplusEins">Code</a> ist öffentlich einsehbar.
          Falls du bei der Entwicklung helfen willst, schreib uns gerne per Mail oder einfach über GitHub.
        </p>
        <p>
          Gebaut mit <a href="https://nuxtjs.org">Nuxt</a>, <a href="https://vuetifyjs.com">Vuetify</a>, <a href="https://github.com/ClickerMonkey/dayspan-vuetify">Dayspan-Vuetify</a>, Icons von <a href="https://materialdesignicons.com/">Material Design Icons</a> und der Schriftart <a href="https://fonts.google.com/specimen/Roboto">Roboto</a>.<br>
          Alle Stundenpläne basieren auf den Inhalten von <a href="http://stundenplan.ostfalia.de/">stundenplan.ostfalia.de</a>.<br>
          Die Mensapläne basieren auf den Inhalten von <a href="https://openmensa.org">OpenMensa</a>.<br>
          Für Vollständigkeit wird keine Haftung übernommen.
        </p>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn
          icon
          outlined
          color="primary"
          target="_blank"
          href="https://github.com/SplusEins/SplusEins"
          rel="noopener"
        >
          <v-icon
            :color="this.$vuetify.theme.dark? 'white': 'black'"
            medium
          >
            {{ mdiGithub }}
          </v-icon>
        </v-btn>
        <v-btn
          text
          depressed
          color="primary"
          @click="dialogOpen = false"
        >
          Schließen
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mdiGithub } from '@mdi/js'

export default {
  name: 'AboutDialog',
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      mdiGithub
    };
  },
  computed: {
    dialogOpen: {
      get () { return this.value; },
      set (value) { this.$emit('input', value); }
    }
  }
};
</script>
