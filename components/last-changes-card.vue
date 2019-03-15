<template>
  <v-card>
    <v-card-title>
      <div class="headline">Letzte Änderungen</div>
    </v-card-title>
    <v-card-text class="card-text-padding">
      <ul>
        <li>Externe Kalender-Anwendungen können angebunden werden</li>
        <li>Statistiken auf der Startseite</li>
        <li>Personalisierte Pläne können erstellt und geteilt werden</li>
        <li>Neuigkeiten aus der Ostfalia auf der Startseite</li>
        <li>SplusEins kann auf modernen Smartphones als App installiert werden</li>
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

