<template>
  <v-dialog
    v-model="dialogOpen"
    max-width="450">
    <v-card>

      <v-toolbar
        dark
        color="red">
        <v-btn
          icon
          dark
          @click.native="dialogOpen = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Cookies sind deaktiviert</v-toolbar-title>
      </v-toolbar>

      <v-card-text class="card-text-padding">
        Du hast Cookies zur Speicherung von Einstellung nicht aktiviert. Dein personalisierter Plan kann also nicht dauerhaft in deinem Browser gespeichert werden, sondern steht nur so lange zur Verfügung, wie du diese Seite besuchst.
        <v-layout
          justify-space-between
          row
          class="layout">
          <v-btn
            flat
            @click="dialogOpen=false; $emit('continue');">
            Trotzdem fortfahren
          </v-btn>
          <v-btn
            flat
            color="success"
            @click="setNecessaryCookiesAllowed(); dialogOpen=false; $emit('continue');">
            Cookies aktivieren
          </v-btn>
        </v-layout>
      </v-card-text>

    </v-card>
  </v-dialog>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

export default {
  name: 'CustomTimetableCookieReminder',
  props: {
    value: {
      type: Boolean,
      default: false
    },
  },
  computed: {
    dialogOpen: {
      get() { return this.value; },
      set(value) { this.$emit('input', value); }
    },
  },
  methods: {
    ...mapMutations({
      setNecessaryCookiesAllowed: 'privacy/setNecessaryCookiesAllowed',
    }),
  }
};
</script>

<style scoped lang="scss">

.card-text-padding{
  padding: 16px 16px 0 16px;
}

.layout{
  padding-top: 10px;
}

</style> 
