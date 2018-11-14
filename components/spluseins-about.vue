<template>
  <span class="text-xs-center">
    <v-dialog
      v-model="active"
      width="500"
    >
      <a
        slot="activator"
        class="white--text">
        Über
      </a>
      <v-card>
        <v-card-title
          class="headline primary"
          primary-title
        >
          SplusEins
        </v-card-title>

        <v-card-text>
          <p>
            Ein inoffizieller Stundenplan von Studenten für Studenten der Ostfalia-Hochschule.<br>
            Gebaut mit <a href="https://nuxtjs.org">Nuxt</a>, <a href="https://vuetifyjs.com">Vuetify</a> und <a href="https://github.com/ClickerMonkey/dayspan-vuetify">Dayspan-Vuetify</a>.<br>
            Besonderer Dank geht an Tim für den <a href="https://github.com/xThunderbolt/splus">Splus Parser</a>.<br>
            Alle Studenpläne basieren auf den Inhalten der öffentlich einsehbaren Website <a href="http://splus.ostfalia.de/">splus.ostfalia.de</a>.<br> Für Vollständigkeit wird keine Haftung übernommen.
          </p>
        </v-card-text>

        <v-divider/>

        <v-card-actions>
          <v-spacer/>
          <v-btn
            flat
            icon
            color="primary"
            target="_blank"
            href="https://github.com/spluseins/spluseins">
            <img
              :src="gitHubIcon"
              class="githubIcon">
          </v-btn>
          <v-btn
            flat
            depressed
            color="primary"
            @click="active = false"
          >
            Schließen
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </span>
</template>


<script>
import gitHubIcon from '../assets/img/gitHub.svg';

export default {
  name: 'SpluseinsAbout',
  data: function() {
    return {
      active: false,
      gitHubIcon: gitHubIcon,
    };
  },
};
</script>


<style scoped lang="scss">
.githubIcon {
  height: 2em;
}
</style>
