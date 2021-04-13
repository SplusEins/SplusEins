<template>
  <v-container
    v-touch="{
      right: () => setSidenav(true)
    }"
    class="container pa-6"
  >
    <div>
      <h1 class="text-h4 my-6">
        Impressum
      </h1>
      <h3>SplusEins Team</h3>
      <br>
      <p><b>Vertreten durch:</b></p>

      <p>{{ team.member1 }}</p>

      <p>{{ team.member2 }}</p>

      <p>{{ team.member3 }}</p>

      <p>{{ team.member4 }}</p>

      <p><b>Kontakt:</b></p>

      <p>E-Mail: team (at) spluseins (Punkt) de </p>

      <br>

      <p>Angaben gemäß § 5 TMG</p>

      <p><b>Haftungsausschluss: Haftung für Inhalte</b></p>

      <p>Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.</p>

      <p><b>Haftung für Links </b></p>

      <p>Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.</p>

      <p><b>Urheberrecht </b></p>

      <p>Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.</p>

      <p>Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.</p>

      <p>
        <em>Website Impressum von impressum-generator.de</em>
      </p>

      <i>Stand 26.11.2018</i>
    </div>
  </v-container>
</template>

<script>
import { mapMutations } from 'vuex';

export default {
  name: 'SpluseinsImpressum',
  head () {
    return {
      title: 'Impressum',
      meta: [
        { hid: 'description', name: 'description', content: 'Impressum' },
        { hid: 'og:description', property: 'og:description', content: 'Impressum' }
      ]
    };
  },
  data () {
    return {
      team: process.env.team
    }
  },
  methods: {
    ...mapMutations({
      setSidenav: 'ui/setSidenav'
    })
  },
  middleware: 'cached'
}
</script>

<style scoped lang="scss">
.container{
  margin: auto;
  max-width: 1100px;
}
</style>
