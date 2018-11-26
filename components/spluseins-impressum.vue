<template>
  <span class="text-xs-center">
    <v-dialog
      v-model="active"
      width="800"
    >
      <a
        slot="activator"
        class="white--text"
        @click="trackMatomoEvent('Footer', 'openImpressum')">
        Impressum
      </a>
      <v-card>
        <v-card-title
          class="headline primary"
          primary-title
        >
          Impressum
        </v-card-title>

        <v-card-text>
          <p>Angaben gemäß § 5 TMG</p>

          <p>SplusEins Team</p>

          <p>Am Exer 2</p>

          <p>38302 Wolfenbüttel</p>

          <p><b>Vertreten durch:</b></p>

          <p class="Teammitglied1">$Teammitglied1</p>

          <p class="Teammitglied2">$Teammitglied2</p>

          <p class="Teammitglied3">$Teammitglied3</p>

          <p class="Teammitglied4">$Teammitglied4</p>

          <p><b>Kontakt:</b></p>

          <p>E-Mail: team (at) spluseins (Punkt) de </p>
          
          <p><b>Haftungsausschluss: Haftung für Inhalte</b></p>

          <p>Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.</p>

          <p><b>Haftung für Links </b></p>

          <p>Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.</p>

          <p><b>Urheberrecht </b></p>

          <p>Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.</p>

          <p>Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.</p>
          
          <p>Website Impressum von impressum-generator.de </p>

        </v-card-text>

        <v-divider/>

        <v-card-actions>
          <v-spacer/>
          <v-btn
            flat
            depressed
            color="primary"
            @click="active = false"
          >
            Schließen
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </span>
</template>		

<script>
export default {
  name: 'SpluseinsImpressum',
  data () {
    return {
      active: false
    }
  },
  methods:{
    trackMatomoEvent (category, action , name) {
      this.$matomo.trackEvent(category, action, name);
    }
  }
}
</script>


<style scoped lang="scss">
</style> 
