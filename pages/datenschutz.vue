<template>
  <v-container 
    v-touch="{
      right: () => setSidenav(true)
    }"
    class="container">
    <div>
      <h1>Datenschutzerklärung</h1>
      <br>
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

      <h2>Ihre Betroffenenrechte</h2>
      <p>Unter den angegebenen Kontaktdaten unseres Datenschutzbeauftragten können Sie jederzeit folgende Rechte ausüben:</p>
      <ul>
        <li>Auskunft über Ihre bei uns gespeicherten Daten und deren Verarbeitung (Art. 15 DSGVO),</li>
        <li>Berichtigung unrichtiger personenbezogener Daten (Art. 16 DSGVO),</li>
        <li>Löschung Ihrer bei uns gespeicherten Daten (Art. 17 DSGVO),</li>
        <li>Einschränkung der Datenverarbeitung, sofern wir Ihre Daten aufgrund gesetzlicher Pflichten noch nicht löschen dürfen (Art. 18 DSGVO),</li>
        <li>Widerspruch gegen die Verarbeitung Ihrer Daten bei uns (Art. 21 DSGVO) und</li>
        <li>Datenübertragbarkeit, sofern Sie in die Datenverarbeitung eingewilligt haben oder einen Vertrag mit uns abgeschlossen haben (Art. 20 DSGVO).</li>
      </ul>
      <br>
      <p>Sofern Sie uns eine Einwilligung erteilt haben, können Sie diese jederzeit mit Wirkung für die Zukunft widerrufen.</p>

      <h2>Cookies &#38; Browser Speicher</h2>
      <h3>Art und Zweck der Verarbeitung:</h3>
      <p>Wie viele andere Webseiten verwenden auch wir so genannte Cookies oder andere Speichermöglichkeiten des Browsers. Hierbei handelt es sich um kleine Datenpakete, die auf Ihrem Endgerät (Laptop, Tablet, Smartphone o.ä.) gespeichert werden, wenn Sie unsere Webseite besuchen. </p>
      <p>Cookies oder der Browserspeicher können nicht verwendet werden, um Programme zu starten oder Viren auf einen Computer zu übertragen. Anhand der gespeicherten Informationen können wir Ihnen die Navigation erleichtern und die korrekte Anzeige unserer Webseiten ermöglichen.</p>
      <p>In keinem Fall werden die von uns erfassten Daten an Dritte weitergegeben oder ohne Ihre Einwilligung eine Verknüpfung mit personenbezogenen Daten hergestellt.</p>
      <p>Natürlich können Sie unsere Website grundsätzlich auch ohne Cookies bzw. ohne Verwendung des Browserspeichers betrachten.</p>
      
      <h3>Zustimmung:</h3>
      <p>Um diese Technologie verwenden zu dürfen müssen Sie uns die Erlaubnis erteilen, indem Sie beispielsweise beim erstmaligen Aufrufen der Seite der Speicherung von Daten im Browser zustimmen.</p>
      <p>Im Allgemeinen können Sie die Verwendung von Cookies jederzeit über die Einstellungen Ihres Browsers deaktivieren. Bitte verwenden Sie die Hilfefunktionen Ihres Internetbrowsers, um zu erfahren, wie Sie diese Einstellungen ändern können. Bitte beachten Sie, dass einzelne Funktionen unserer Website möglicherweise nicht funktionieren, wenn Sie die Verwendung von Cookies deaktiviert haben.</p>
      
      <h3>Gespeicherte Informationen:</h3>
      <p>Soweit Sie uns durch Ihre Zustimmung die Speicherung von Daten im Browser erlauben, können folgende Informationen durch unseren Webseiten gespeichert werden:</p>
      <ul>
        <li>personalisierte Stundenpläne</li>
        <li>favorisierte Stundenpläne</li>
        <li>ausgewählte Themes</li>
      </ul>
      <br>
      <p>Sie können über Ihre Browsereinstellungen gespeicherte Daten löschen. Je nach Anbieter Ihres Browsers finden Sie die notwendigen Informationen auf deren Webseiten.</p>
      <h2>Verwendung von Matomo</h2>
      <h3>Art und Zweck der Verarbeitung:</h3>
      <p>Diese Website benutzt Matomo (ehemals Piwik), eine Open-Source-Software zur statistischen Auswertung von Besucherzugriffen. Anbieter der Software Matomo ist die InnoCraft Ltd., 150 Willis St, 6011 Wellington, Neuseeland.</p>
      <p>Matomo verwendet sog. Cookies, also Textdateien, die auf Ihrem Computer gespeichert werden und die eine Analyse der Benutzung der Website durch Sie ermöglichen.</p>
      <p>Die durch das Cookie erzeugten Informationen über Ihre Nutzung des Internetangebotes werden auf einem Server in Deutschland gespeichert.</p>
      <p>Die IP-Adresse wird unmittelbar nach der Verarbeitung und vor deren Speicherung anonymisiert. Sie haben die Möglichkeit, die Installation der Cookies durch Änderung der Einstellung Ihrer Browser-Software zu verhindern. Wir weisen Sie darauf hin, dass bei entsprechender Einstellung eventuell nicht mehr alle Funktionen dieser Website zur Verfügung stehen.</p>
      <p>Sie können sich entscheiden, ob in Ihrem Browser ein eindeutiger Webanalyse-Cookie abgelegt werden darf, um dem Betreiber der Webseite die Erfassung und Analyse verschiedener statistischer Daten zu ermöglichen.</p>
      <h3>Getrackte Informationen:</h3>
      <p>Soweit Sie uns durch Ihre Zustimmung die Analyse Ihres Nutzerverhaltens erlauben, können folgende Informationen durch unseren Webseiten gespeichert werden:</p>
      <ul>
        <li>verwendeter Internetbrowser</li>
        <li>einfache Geräteinformationen</li>
        <li>Seitenaufrufe</li>
        <li>Nutzung von Navigationselementen</li>
      </ul>
      <br>          
      <h3>Zustimmung:</h3>
      <p>Die Verarbeitung der Daten erfolgt auf Grundlage einer Einwilligung des Nutzers (Art. 6 Abs. 1 lit. a DSGVO).</p>
      <p>Sie willigen ein, indem sie in einem Dialogfenster der Seite, welches überlicherweise beim ersten Aufruf angezeit wird, die Analyse von Daten akzeptieren.</p>
      <h3>Empfänger:</h3>
      <p>Die Daten werden nicht an Dritte weitergegeben.</p>
      <h3>Widerruf der Einwilligung:</h3>
      <p>Sie können die Speicherung der Cookies durch eine entsprechende Einstellung Ihrer Browser-Software verhindern. Dazu zählt beispielsweise das Aktivieren der "Do Not Track" Einstellung. Wir weisen Sie jedoch darauf hin, dass Sie in diesem Fall gegebenenfalls nicht sämtliche Funktionen dieser Website vollumfänglich werden nutzen können.</p>
      <h3>Profiling:</h3>
      <p>Mit Hilfe des Tracking-Tools Matomo kann das Verhalten der Besucher der Webseite bewertet und die Interessen analysiert werden. Hierzu erstellen wir ein pseudonymes Nutzerprofil.</p>
      <h2>Verwendung von Scriptbibliotheken (Google Webfonts)</h2>
      <h3>Art und Zweck der Verarbeitung:</h3>
      <p>Um unsere Inhalte browserübergreifend korrekt und grafisch ansprechend darzustellen, verwenden wir auf dieser Website „Google Web Fonts“ der Google LLC (1600 Amphitheatre Parkway, Mountain View, CA 94043, USA; nachfolgend „Google“) zur Darstellung von Schriften.</p>
      <p>Die Datenschutzrichtlinie des Bibliothekbetreibers Google finden Sie hier: <a href="https://www.google.com/policies/privacy/">https://www.google.com/policies/privacy/</a></p>
      <h3>Rechtsgrundlage:</h3>
      <p>Rechtsgrundlage für die Einbindung von Google Webfonts und dem damit verbundenen Datentransfer zu Google ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). </p>
      <h3>Empfänger:</h3>
      <p>Der Aufruf von Scriptbibliotheken oder Schriftbibliotheken löst automatisch eine Verbindung zum Betreiber der Bibliothek aus. Dabei ist es theoretisch möglich – aktuell allerdings auch unklar ob und ggf. zu welchen Zwecken – dass der Betreiber in diesem Fall Google Daten erhebt.</p>
      <h3>Speicherdauer:</h3>
      <p>Wir erheben keine personenbezogenen Daten, durch die Einbindung von Google Webfonts.</p>
      <p>Weitere Informationen zu Google Web Fonts finden Sie unter <a href="https://developers.google.com/fonts/faq">https://developers.google.com/fonts/faq</a> und in der Datenschutzerklärung von Google: <a href="https://www.google.com/policies/privacy/">https://www.google.com/policies/privacy/</a>.</p>
      <h3>Drittlandtransfer:</h3>
      <p>Google verarbeitet Ihre Daten in den USA und hat sich dem EU_US Privacy Shield unterworfen <a href="https://www.privacyshield.gov/EU-US-Framework">https://www.privacyshield.gov/EU-US-Framework</a>.</p>
      <h3>Bereitstellung vorgeschrieben oder erforderlich:</h3>
      <p>Die Bereitstellung der personenbezogenen Daten ist weder gesetzlich, noch vertraglich vorgeschrieben. Allerdings kann ohne die korrekte Darstellung der Inhalte von Standardschriften nicht ermöglicht werden.</p>
      <h3>Widerruf der Einwilligung:</h3>
      <p>Zur Darstellung der Inhalte wird regelmäßig die Programmiersprache JavaScript verwendet. Sie können der Datenverarbeitung daher widersprechen, indem Sie die Ausführung von JavaScript in Ihrem Browser deaktivieren oder einen Einbindung JavaScript-Blocker installieren. Bitte beachten Sie, dass es hierdurch zu Funktionseinschränkungen auf der Website kommen kann.</p>
      <h2>Zugriffsdaten</h2>
      <p>Der Websitebetreiber bzw. Seitenprovider erhebt Daten über Zugriffe auf die Seite und speichert diese als „Server-Logfiles“ ab. Folgende Daten werden so protokolliert:</p>
      <ul>
        <li>Besuchte Website</li>
        <li>Uhrzeit zum Zeitpunkt des Zugriffes</li>
        <li>Menge der gesendeten Daten in Byte</li>
        <li>Verwendeter Browser</li>
        <li>Verwendetes Betriebssystem</li>
        <li>Verwendete IP-Adresse</li>
      </ul>
      <br>
      <p>Die erhobenen Daten dienen lediglich zur Verbesserung der Website. Der Websitebetreiber behält sich allerdings vor, die Server-Logfiles nachträglich zu überprüfen, sollten konkrete Anhaltspunkte auf eine rechtswidrige Nutzung hinweisen.</p>
      <h2>SSL-Verschlüsselung</h2>
      <p>Um die Sicherheit Ihrer Daten bei der Übertragung zu schützen, verwenden wir dem aktuellen Stand der Technik entsprechende Verschlüsselungsverfahren (z. B. SSL) über HTTPS.</p>
      <h2>Änderung unserer Datenschutzbestimmungen</h2>
      <p>Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen in der Datenschutzerklärung umzusetzen, z.B. bei der Einführung neuer Services. Für Ihren erneuten Besuch gilt dann die neue Datenschutzerklärung.</p>
      <p>
        <em>Die Datenschutzerklärung wurde mit Hilfe des Datenschutzerklärungs-Generators der activeMind AG erstellt. Die Inhalte wurden auf spluseins.de angepasst.</em>
      </p>
      <i>Stand 26.11.2018</i>

    </div>
  </v-container>
</template>		

<script>
import { mapMutations } from 'vuex';
import PROTECTED_INFORMATION from '~/assets/protected-information.json';
import META_INFORMATION from '~/assets/meta-information.json';

export default {
  name: 'SpluseinsDataPrivacy',
  head() {
    return {
      title: 'Datenschutz',
      meta: [
        { hid: 'description', name: 'description', content: 'Datenschutz –' + META_INFORMATION.description },
        { hid: 'og:description', name: 'og:description', content: 'Datenschutz –' + META_INFORMATION.description }
      ],
    };
  },
  data() {
    return {
      team: PROTECTED_INFORMATION.team
    }
  },
  methods: {
    ...mapMutations({
      setSidenav: 'ui/setSidenav',
    }),
  },
}
</script>

<style scoped lang="scss">
.container{
  margin: auto;
  max-width: 1100px;
}
</style> 
