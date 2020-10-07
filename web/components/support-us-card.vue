<template>
  <v-card>
    <v-card-title>
      <div class="headline">
        Unterstütze das Team
      </div>
    </v-card-title>
    <v-card-text class="card-text-padding">
      <p>
        SplusEins ist ein Freizeitprojekt, welches das Ziel hat den Ostfalia Stundenplan (ehemals SPLUS) 
        sowie den Mensaplan der Hochschule Wolfenbüttel ansprechend darzustellen.<br><br>Möchtest du uns motivieren?<br>
        Für 2€ bezahlst du uns den Server für einen Monat. Wir nehmen dich und deine Nachricht in die Liste auf.
      </p>
      <b>Unsere Unterstützer</b>
      <ul>
        <li>Anonym - 6 Monate "Überboten, erster :)"</li>
        <li>Kevin - 5 Monate "Nices Ding"</li>
        <li>Florian H. – 5 Monate "✌️"</li>
        <li>Anonym – 5 Monate "Ich bin der Uwe und ich bin auch dabei"</li>
        <li>Paul - 2.5 Monate</li>
        <li>Lea – 2 Monate "Spitzenmäßig"</li>
        <li>Florian B. – 2 Monate "Tolle Arbeit, weiter so!"</li>
        <li>Philipp - 1 Monat</li>
        <li>Lysanne – 1 Monat "Fast ganz oben! 🎈"</li>
        <li>Brian – 1 Monat "Macht so weiter! :-)"</li>
        <li>Nikolai – 0.5 Monate "Danke für SplusEins :)"</li>
      </ul>
    </v-card-text>
    <v-card-actions>
      <v-btn
        flat
        color="primary"
        @click="sendMoneyOpen = true"
      >
        <span class="mr-3">💸</span>
        senden
      </v-btn>
    </v-card-actions>

    <v-bottom-sheet
      v-model="sendMoneyOpen"
      inset
    >
      <v-list>
        <v-subheader>Spenden</v-subheader>
        <v-list-tile
          href="https://paypal.me/schneefux"
          @click="sendMoneyOpen = false"
        >
          <v-list-tile-avatar>
            <v-avatar
              size="32px"
              tile
            >
              <v-icon>mdi-paypal</v-icon>
            </v-avatar>
          </v-list-tile-avatar>
          <v-list-tile-title>PayPal</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-bottom-sheet>
  </v-card>
</template>

<script>
export default {
  name: 'SupportUsCard',
  data() {
    return {
      sendMoneyOpen: false,
    }
  },
};
</script>

<style lang="scss">

.card-text-padding{
  padding-top: 0px;
}

</style>
