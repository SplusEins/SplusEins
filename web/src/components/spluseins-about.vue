<template>
  <v-dialog v-model="dialogOpen" width="500">
    <v-card>
      <v-card-title class="bg-primary px-4"> SplusEins </v-card-title>
      <v-card-text class="px-4 pt-2 pb-0">
        <p class="mb-4">
          Ein inoffizieller Stundenplan von Studenten für Studenten der
          Ostfalia.
        </p>
        <p class="mb-4">
          Hilfe zu SplusEins findest du in der
          <a href="https://spluseins.de/docs/benutzer.html#erste-schritte"
            >Benutzerdokumentation</a
          >. Solltest du trotzdem Probleme haben, schreib uns doch gerne per
          Mail: team(at)spluseins(punkt)de.
        </p>
        <p class="mb-4">
          Der <a href="https://github.com/SplusEins/SplusEins">Code</a> ist
          öffentlich einsehbar. Falls du bei der Entwicklung helfen willst,
          schreib uns gerne per Mail oder einfach über GitHub.
        </p>
        <p class="mb-4">
          Gebaut mit <a href="https://vuejs.org">Vue</a>,
          <a href="https://vuetifyjs.com">Vuetify</a>, Icons von
          <a href="https://materialdesignicons.com/">Material Design Icons</a>
          und der Schriftart
          <a href="https://fonts.google.com/specimen/Roboto">Roboto</a>.<br />
          Alle Stundenpläne basieren auf den Inhalten von
          <a href="http://stundenplan.ostfalia.de/">stundenplan.ostfalia.de</a>
          und
          <a href="https://intranet-i.ostfalia.de/fips/stundenplan/"
            >intranet-i.ostfalia.de/fips/stundenplan/</a
          >. Die Mensapläne basieren auf den Inhalten von
          <a href="https://openmensa.org">OpenMensa</a>. Die Raumstandorte
          basieren auf Daten von
          <a href="https://www.openstreetmap.org/copyright">© OpenStreetMap</a>,
          verfügbar unter der Open Database Licence. Für Vollständigkeit wird
          keine Haftung übernommen.
        </p>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn
          :icon="mdiGithub"
          variant="outlined"
          size="small"
          target="_blank"
          href="https://github.com/SplusEins/SplusEins"
          rel="noopener"
          aria-label="GitHub"
        />
        <v-btn color="primary" @click="dialogOpen = false"> Schließen </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { mdiGithub } from '@mdi/js';

/* v-model: whether the dialog is open */
const dialogOpen = defineModel({ type: Boolean, default: false });
</script>
