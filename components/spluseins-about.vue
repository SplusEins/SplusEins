<template>
  <span class="text-xs-center">
    <v-dialog
      v-model="active"
      width="500"
    >
      <a
        slot="activator"
        class="white--text"
        @click="trackMatomoEvent('Footer', 'openAbout')">
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
            Das <a href="https://github.com/spluseins/spluseins">Repository</a> sowie das <a href="https://trello.com/b/8L18rOVd/spluseins-öffentlich">Trello Board</a> sind öffentlich einsehbar. 
            Besonderer Dank geht an Tim für den <a href="https://github.com/xThunderbolt/splus">Splus Parser</a>.<br>
            Alle Studenpläne basieren auf den Inhalten der öffentlich einsehbaren Website <a href="http://splus.ostfalia.de/">splus.ostfalia.de</a>.<br>
            Die Mensapläne basieren auf den Inhalten von <a href="https://openmensa.org">OpenMensa</a>.<br>
            Für Vollständigkeit wird keine Haftung übernommen.
          </p>
        </v-card-text>

        <v-divider/>

        <v-card-actions>
          <v-spacer/>
          <v-btn
            icon
            medium
            outline
            color="primary"
            target="_blank"
            href="https://github.com/spluseins/spluseins">
            <v-icon
              medium
              color="black">mdi-github-circle</v-icon>
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
import GithubBox from '../node_modules/vue-material-design-icons/GithubBox.vue';
import gitHubIcon from '../assets/img/gitHub.svg';

export default {
  name: 'SpluseinsAbout',
  components:{
    GithubBox: GithubBox
  },
  data: function() {
    return {
      active: false,
      gitHubIcon: gitHubIcon,
    };
  },
  methods:{
    trackMatomoEvent (category, action , name) {
      this.$matomo.trackEvent(category, action, name);
    }
  }
};
</script>


<style scoped lang="scss">
.githubIcon{
  height: 2em;
}

.test123:hover{
  cursor: pointer;
}
.test123{
  fill: palegreen !important;
}
</style>
