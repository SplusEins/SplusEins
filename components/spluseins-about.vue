<template>
  <span class="text-xs-center">
    <v-dialog
      v-model="active"
      width="500"
    >
      <span
        slot="activator"
        class="about"
        white--text>
        Über
      </span>
      <v-card
        dark>
        <v-card-title
          class="headline black"
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
          <a 
            class="githubIcon" 
            href="https://github.com/spluseins/spluseins" 
            target="_blank">
            <img
              :src="gitHubIcon">
          </a>
          <v-btn
            flat
            depressed
            dark
            outline
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
import gitHubIcon from "../assets/img/gitHub.svg"

export default {
  name: 'SpluseinsAbout',
  props: {
    active : {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      gitHubIcon: gitHubIcon
    }
  }
}
</script>


<style scoped lang="scss">
@import '../assets/style/colors.scss';
.githubIcon {
  padding: 5px 10px 0 5px;
}

.about:hover{
  color: $amber;
}

a{
  color : white;
}
</style>