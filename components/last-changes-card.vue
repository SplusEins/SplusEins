<template>
  <v-card>
    <v-card-title>
      <div class="headline">Letzte Änderungen</div>
    </v-card-title>
    <v-card-text class="card-text-padding">
      <ul>
        <li>Ein Stundenplan kann in externen Kalender-Anwendungen importiert und abonniert werden.</li>
        <li>Auf der Startseite werden Statistiken zum abonnierten Plan angezeigt.</li>
        <li>Jeder Benutzer kann sich personalisierte Pläne aus verschiedenen Stundenplänen zusammenstellen und teilen.</li>
        <li>Auf der Startseite werden Neuigkeiten aus konfigurierbaren Quellen der Ostfalia angezeigt.</li>
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

