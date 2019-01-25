<template>
  <v-card>
    <v-card-title>
      <div class="headline">Letzte Änderungen</div>
    </v-card-title>
    <v-card-text class="card-text-padding">
      <ul>
        <li>Der (vorläufige) Stundenplan für das Sommersemester 2019 kann abgerufen werden.</li>
        <li>Auf der Startseite wird die nächste Vorlesung eines abbonierten Planes angzeigt.</li>
        <li>Jeder Benutzer kann sich personalisierte Pläne aus verschiedenen Stundenplänen zusammenstellen und teilen.</li>
        <li>Durch Anklicken der Veranstaltungen in einem Stundenplan können weitere Informationen abgerufen werden.</li>
        <li>Der Mensaplan für Wolfenbüttel kann abgerufen werden.</li>
        <li>SplusEins kann auf Smartphones mit einem modernen Browser als App installiert werden.</li>
      </ul>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'LastChangesCard',
};
</script>

<style lang="scss">

.card-text-padding{
  padding-top: 0px;
}

</style>

