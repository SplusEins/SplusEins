<template>
  <v-card>
    <v-card-title>
      <div class="headline">
        Unterstütze das Team
      </div>
    </v-card-title>
    <v-card-text class="card-text-padding">
      <p>
        SplusEins ist ein Freizeitprojekt. Möchtest du uns motivieren? <br />
        Für 2€ bezahlst du uns den Server für einen Monat. Wir nehmen dich und deine Nachricht in die Liste auf.
      </p>
      <b>Unsere Unterstützer</b>
      <ul>
        <li>Lea – 2 Monate "Spitzenmäßig"</li>
        <li>Florian – 2 Monate "Tolle Arbeit, weiter so!"</li>
        <li>Lysanne – 1 Monat "Fast ganz oben! 🎈"</li>
        <li>Brian – 1 Monat "Macht so weiter! :-)"</li>
        <li>Anonym – 1 Monat</li>
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
        @click="sendMoneyOpen = true"
      >
        <span class="mr-3">💸</span>
        senden
      </v-btn>
      <v-btn
        flat
        color="primary"
        href="javascript:location='mailto:\u0074\u0065\u0061\u006d\u0040\u0073\u0070\u006c\u0075\u0073\u0065\u0069\u006e\u0073\u002e\u0064\u0065';void 0"
      >
        <span class="mr-3">❤️</span>
        senden (Mail)
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
        <v-list-tile
          href="bitcoin:3MAZp21eRAo4HjngDSieofWNGVg9tJXg74"
          @click="sendMoneyOpen = false"
        >
          <v-list-tile-avatar>
            <v-avatar
              size="32px"
              tile
            >
              <v-icon>mdi-bitcoin</v-icon>
            </v-avatar>
          </v-list-tile-avatar>
          <v-list-tile-title>Bitcoin: 3MAZp21eRAo4HjngDSieofWNGVg9tJXg74</v-list-tile-title>
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
