<template>
  <lazy-hydrate
    ssr-only
    :trigger-hydration="dialogOpen"
  >
    <v-dialog
      v-model="dialogOpen"
      width="500"
    >
      <v-card>
        <v-card-title
          class="headline primary"
          primary-title
        >
          SplusEins
        </v-card-title>

        <v-card-text class="text-padding">
          <p>
            Ein inoffizieller Stundenplan von Studenten für Studenten der Ostfalia-Hochschule.<br>
            Gebaut mit <a href="https://nuxtjs.org">Nuxt</a>, <a href="https://vuetifyjs.com">Vuetify</a>, <a href="https://github.com/ClickerMonkey/dayspan-vuetify">Dayspan-Vuetify</a>, Icons von <a href="https://materialdesignicons.com/">Material Design Icons</a> und der Schriftart <a href="https://fonts.google.com/specimen/Roboto">Roboto</a>.<br>
            Das <a href="https://github.com/SplusEins/SplusEins">Repository</a> sowie das <a href="https://trello.com/b/8L18rOVd">Trello Board</a> sind öffentlich einsehbar.
            Besonderer Dank geht an Tim für den <a href="https://github.com/xThunderbolt/splus">Splus Parser</a>.<br>
            Alle Studenpläne basieren auf den Inhalten der öffentlich einsehbaren Website <a href="http://splus.ostfalia.de/">splus.ostfalia.de</a>.<br>
            Die Mensapläne basieren auf den Inhalten von <a href="https://openmensa.org">OpenMensa</a>.<br>
            Für Vollständigkeit wird keine Haftung übernommen.
          </p>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn
            icon
            outline
            color="primary"
            target="_blank"
            href="https://github.com/SplusEins/SplusEins"
          >
            <v-icon
              :color="isDark? 'white': 'black'"
              medium
            >
              mdi-github-circle
            </v-icon>
          </v-btn>
          <v-btn
            flat
            depressed
            color="primary"
            @click="dialogOpen = false"
          >
            Schließen
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </lazy-hydrate>
</template>


<script>
import { mapState } from 'vuex';

export default {
  name: 'AboutDialog',
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
    ...mapState({
      isDark: (state) => state.ui.isDark,
    }),
  },
};
</script>

<style scoped lang="scss">
.text-padding{
  padding: 10px 16px 0px 16px;
}
</style>
