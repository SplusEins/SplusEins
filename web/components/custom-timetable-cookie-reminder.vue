<template>
  <v-dialog
    v-model="dialogOpen"
    max-width="400"
  >
    <v-card tile>
      <v-toolbar
        flat
        dark
        color="red"
      >
        <v-btn
          icon
          dark
          @click="dialogOpen = false"
        >
          <v-icon>{{ mdiClose }}</v-icon>
        </v-btn>
        <v-toolbar-title>Cookies sind deaktiviert</v-toolbar-title>
      </v-toolbar>

      <v-card-text class="pa-4">
        Du hast Cookies zur Speicherung von Einstellung nicht aktiviert. Dein personalisierter Plan kann also nicht dauerhaft in deinem Browser gespeichert werden, sondern steht nur so lange zur Verfügung, wie du diese Seite besuchst.
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          text
          @click="dialogOpen=false; $emit('continue');"
        >
          Fortfahren
        </v-btn>
        <v-btn
          text
          color="success"
          @click="setNecessaryCookiesAllowed(); dialogOpen=false; $emit('continue');"
        >
          Aktivieren
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapMutations } from 'vuex';
import { mdiClose } from '@mdi/js'

export default {
  name: 'CustomTimetableCookieReminder',
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      mdiClose
    };
  },
  computed: {
    dialogOpen: {
      get () { return this.value; },
      set (value) { this.$emit('input', value); }
    }
  },
  methods: {
    ...mapMutations({
      setNecessaryCookiesAllowed: 'privacy/setNecessaryCookiesAllowed'
    })
  }
};
</script>
