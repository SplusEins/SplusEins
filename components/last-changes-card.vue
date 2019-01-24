<template>
  <v-card>
    <v-card-title>
      <div class="headline">Letzte Änderungen</div>
    </v-card-title>
    <v-card-text class="card-text-padding">
      <ul>
        <li>Auf der Startseite werden die wichtigsten Informationen in einem Dashboard zusammengefasst.</li>
        <li>Der Essensplan der Mensa Wolfenbüttel wird angezeigt.</li>
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

