<template>
  <v-container
    v-touch="{
      right: () => setSidenav(true)
    }"
    class="container pa-6"
  >
    <h1 class="text-h4 my-5">
      Über SplusEins
    </h1>
    <div class="mb-6 text-h6 font-weight-thin">
      Ein inoffizieller Stundenplan von Studenten für Studenten der Ostfalia.
    </div>

    <p>
      Hilfe findest du in der <a href="https://spluseins.de/docs/benutzer.html#erste-schritte">Benutzerdokumentation</a>.
      Solltest du trotzdem Probleme haben, schreib uns doch gerne per Mail team(at)spluseins(punkt)de.
    </p>
    <p>
      Der <a href="https://github.com/SplusEins/SplusEins">Code</a> ist öffentlich einsehbar.
      Falls du bei der Entwicklung helfen möchtest, schreib uns gerne per Mail oder einfach über GitHub.
    </p>

    <v-timeline
      class="mb-5"
      :dense="$vuetify.breakpoint.mobile"
    >
      <v-timeline-item
        v-for="(item, i) in items"
        :key="i"
        small
      >
        <template #opposite>
          <span class="text-h6 font-weight-bold">{{ item.date }}</span>
        </template>
        <v-card elevation="3">
          <v-card-title>
            <span
              v-if="$vuetify.breakpoint.mobile"
              class="pr-2 font-weight-light"
            >
              {{ item.date }}
            </span>
            {{ item.title }}
          </v-card-title>
          <v-card-text>{{ item.text }}</v-card-text>
        </v-card>
      </v-timeline-item>
    </v-timeline>
    <div class="text-body-2">
      <p>Gebaut mit <a href="https://nuxtjs.org">Nuxt</a>, <a href="https://vuetifyjs.com">Vuetify</a>, Icons von <a href="https://materialdesignicons.com/">Material Design Icons</a> und der Schriftart <a href="https://fonts.google.com/specimen/Roboto">Roboto</a>.</p>
      <p>
        Alle Stundenpläne basieren auf den Inhalten von <a href="http://stundenplan.ostfalia.de/">stundenplan.ostfalia.de</a>.
        Die Mensapläne basieren auf den Inhalten von <a href="https://openmensa.org">OpenMensa</a>.
      </p>
      <p>Für Vollständigkeit wird keine Haftung übernommen.</p>
    </div>
  </v-container>
</template>

<script>
import { mapMutations } from 'vuex';
import { mdiGithub } from '@mdi/js'

export default {
  name: 'SpluseinsImpressum',
  head () {
    return {
      title: 'Impressum',
      meta: [
        { hid: 'description', name: 'description', content: 'Impressum' },
        { hid: 'og:description', property: 'og:description', content: 'Impressum' }
      ]
    };
  },
  data () {
    return {
      team: process.env.team,
      mdiGithub,
      items: [
        {
          title: 'Erste Version von SplusEins',
          text: 'Lorem ipsum dolor sit amet, no nam oblique veritus. Commune scaevola imperdiet nec ut, sed euismod convenire principes at.',
          date: 'WS 2018'
        },
        {
          title: 'Erste Version von SplusEins',
          text: 'Lorem ipsum dolor sit amet, no nam oblique veritus. Commune scaevola imperdiet nec ut, sed euismod convenire principes at.',
          date: 'WS 2020'
        },
        {
          title: 'Erste Version von SplusEins',
          text: 'Lorem ipsum dolor sit amet, no nam oblique veritus. Commune scaevola imperdiet nec ut, sed euismod convenire principes at.',
          date: 'SS 2021'
        }
      ]
    }
  },
  methods: {
    ...mapMutations({
      setSidenav: 'ui/setSidenav'
    })
  },
  middleware: 'cached'
}
</script>

<style scoped lang="scss">
.container{
  max-width: 1100px;
}
</style>
