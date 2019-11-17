<template>
  <v-card>
    <v-card-title>
      <div class="headline">
        Unterstütze Uns
      </div>
    </v-card-title>
    <v-card-text class="card-text-padding">
      <p>
        SplusEins ist ein Freizeitprojekt. Möchtest du uns motivieren? <br />
        Für 2€ bezahlst du uns den Server für einen Monat. Wir nehmen dich und deine Nachricht in die Liste auf.
      </p>
      <b>Unsere Unterstützer</b>
      <ul>
        <li>Timo</li>
        <li>Fabian</li>
        <li>Jan</li>
        <li>Finn</li>
      </ul>
    </v-card-text>
    <v-card-actions>
      <v-btn
        flat
        color="primary"
        href="http://paypal.me/schneefux"
      >
        💸 senden (PayPal)
      </v-btn>
      <v-btn
        flat
        color="primary"
        href="mailto:team@spluseins.de?subject=❤️"
      >
        ❤️ senden (Mail)
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'SupportUsCard',
};
</script>

<style lang="scss">

.card-text-padding{
  padding-top: 0px;
}

</style>

