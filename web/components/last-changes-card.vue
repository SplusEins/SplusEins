<template>
  <v-card>
    <v-card-title>
      <div class="headline">
        Neues von SplusEins
      </div>
    </v-card-title>
    <v-card-text class="card-text-padding">
      <ul>
        <li>Dieser Server wird jetzt von der Fakultät Informatik zur Verfügung gestellt, weshalb wir auch unter <a href="https://spluseins-i.ostfalia.de">spluseins-i.ostfalia.de</a> erreichbar sind.</li>
        <li>Da die Serverkosten von der Fakultät getragen werden, haben wir die Spendenmöglichkeit entfernt. Trotzdem möchten wir uns hier nochmal bei Kevin, Florian H., Paul, Lea, Florian B. und den vielen anderen bedanken, die uns mit Spenden und freundlichen Nachrichten motiviert haben &lt;3</li>
        <li>Wenn eure Fakultät die Pläne nur als PDF zur Verfügung stellt, können diese leider nicht in SplusEins angezeigt werden.</li>
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

