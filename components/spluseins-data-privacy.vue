<template>
  <span class="text-xs-center">
    <v-dialog
      v-model="active"
      width="800"
    >
      <a
        slot="activator"
        class="white--text"
        @click="trackMatomoEvent('Footer', 'openDataPrivacy')">
        Datenschutz
      </a>
      <v-card>
        <v-card-title
          class="headline primary"
          primary-title
        >
          Datenschutzerklärung
        </v-card-title>

        <v-card-text>

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

          <h2>Cookies</h2>
          <h3>Art und Zweck der Verarbeitung:</h3>
          <p>Wie viele andere Webseiten verwenden wir auch so genannte „Cookies“. Bei Cookies handelt es sich um kleine Textdateien, die auf Ihrem Endgerät (Laptop, Tablet, Smartphone o.ä.) gespeichert werden, wenn Sie unsere Webseite besuchen. </p>
          <p>Hierdurch erhalten wir bestimmte Daten wie z. B. IP-Adresse, verwendeter Browser und Betriebssystem.</p>
          <p>Cookies können nicht verwendet werden, um Programme zu starten oder Viren auf einen Computer zu übertragen. Anhand der in Cookies enthaltenen Informationen können wir Ihnen die Navigation erleichtern und die korrekte Anzeige unserer Webseiten ermöglichen.</p>
          <p>In keinem Fall werden die von uns erfassten Daten an Dritte weitergegeben oder ohne Ihre Einwilligung eine Verknüpfung mit personenbezogenen Daten hergestellt.</p>
          <p>Natürlich können Sie unsere Website grundsätzlich auch ohne Cookies betrachten. Internet-Browser sind regelmäßig so eingestellt, dass sie Cookies akzeptieren. Im Allgemeinen können Sie die Verwendung von Cookies jederzeit über die Einstellungen Ihres Browsers deaktivieren. Bitte verwenden Sie die Hilfefunktionen Ihres Internetbrowsers, um zu erfahren, wie Sie diese Einstellungen ändern können. Bitte beachten Sie, dass einzelne Funktionen unserer Website möglicherweise nicht funktionieren, wenn Sie die Verwendung von Cookies deaktiviert haben.</p>
          
          <h3>Speicherdauer und eingesetzte Cookies:</h3>
          <p>Soweit Sie uns durch Ihre Browsereinstellungen oder Zustimmung die Verwendung von Cookies erlauben, können folgende Cookies auf unseren Webseiten zum Einsatz kommen:</p>
          <ul>
            <li>Speicherung der personalisierten Stundenpläne</li>
            <li>Speicherung der favorisierten Stundenpläne</li>
            <li>Speicherung des ausgewählten Themes</li>
          </ul>
          <br>
          <p>Sie können über Ihre Browsereinstellungen einzelne Cookies oder den gesamten Cookie-Bestand löschen. Darüber hinaus erhalten Sie Informationen und Anleitungen, wie diese Cookies gelöscht oder deren Speicherung vorab blockiert werden können. Je nach Anbieter Ihres Browsers finden Sie die notwendigen Informationen unter den nachfolgenden Links:</p>
          <ul>
            <li>Mozilla Firefox: 
              <a 
                href="https://support.mozilla.org/de/kb/cookies-loeschen-daten-von-websites-entfernen" 
                target="_blank" 
                rel="nofollow noopener">https://support.mozilla.org/de/kb/cookies-loeschen-daten-von-websites-entfernen
              </a>
            </li>
            <li>Internet Explorer: 
              <a 
                href="https://support.microsoft.com/de-de/help/17442/windows-internet-explorer-delete-manage-cookies" 
                target="_blank" 
                rel="nofollow noopener">https://support.microsoft.com/de-de/help/17442/windows-internet-explorer-delete-manage-cookies
              </a>
            </li>
            <li>Google Chrome: 
              <a 
                href="https://support.google.com/accounts/answer/61416?hl=de" 
                target="_blank" 
                rel="nofollow noopener">https://support.google.com/accounts/answer/61416?hl=de
              </a>
            </li>
            <li>Opera: 
              <a 
                href="http://www.opera.com/de/help" 
                target="_blank" 
                rel="nofollow noopener">http://www.opera.com/de/help
              </a>
            </li>
            <li>Safari: 
              <a 
                href="https://support.apple.com/kb/PH17191?locale=de_DE&viewlocale=de_DE" 
                target="_blank" 
                rel="nofollow noopener">https://support.apple.com/kb/PH17191?locale=de_DE&viewlocale=de_DE
              </a>
            </li>
          </ul>
          <br>
          <h2>Verwendung von Matomo</h2>
          <h3>Art und Zweck der Verarbeitung:</h3>
          <p>Diese Website benutzt Matomo (ehemals Piwik), eine Open-Source-Software zur statistischen Auswertung von Besucherzugriffen. Anbieter der Software Matomo ist die InnoCraft Ltd., 150 Willis St, 6011 Wellington, Neuseeland.</p>
          <p>Matomo verwendet sog. Cookies, also Textdateien, die auf Ihrem Computer gespeichert werden und die eine Analyse der Benutzung der Website durch Sie ermöglichen.</p>
          <p>Die durch das Cookie erzeugten Informationen über Ihre Nutzung des Internetangebotes werden auf einem Server in Deutschland gespeichert.</p>
          <p>Die IP-Adresse wird unmittelbar nach der Verarbeitung und vor deren Speicherung anonymisiert. Sie haben die Möglichkeit, die Installation der Cookies durch Änderung der Einstellung Ihrer Browser-Software zu verhindern. Wir weisen Sie darauf hin, dass bei entsprechender Einstellung eventuell nicht mehr alle Funktionen dieser Website zur Verfügung stehen.</p>
          <p>Sie können sich entscheiden, ob in Ihrem Browser ein eindeutiger Webanalyse-Cookie abgelegt werden darf, um dem Betreiber der Webseite die Erfassung und Analyse verschiedener statistischer Daten zu ermöglichen.</p>
          <p>Nähere Informationen zu den Privatsphäre-Einstellungen der Matomo Software finden Sie unter folgendem Link: 
            <a 
              href="https://matomo.org/docs/privacy/" 
              target="_blank"
              rel="nofollow noopener">
              <em>https://matomo.org/docs/privacy/</em>
            </a>
            <em>.</em>
          </p>
          <h3>Rechtsgrundlage:</h3>
          <p>Die Verarbeitung der Daten erfolgt auf Grundlage einer Einwilligung des Nutzers (Art. 6 Abs. 1 lit. a DSGVO).</p>
          <h3>Empfänger:</h3>
          <p>Die Daten werden nicht an Dritte weitergegeben.</p>
          <h3>Speicherdauer:</h3>
          <p>Die Löschung der Daten erfolgt, sobald diese für unsere Aufzeichnungszwecke nicht mehr erforderlich sind.</p>
          <p>In unserem Fall geschieht die nach folgendem Zeitraum: 1 Jahr.</p>
          <h3>Bereitstellung vorgeschrieben oder erforderlich:</h3>
          <p>Die Bereitstellung Ihrer personenbezogenen Daten erfolgt freiwillig, allein auf Basis Ihrer Einwilligung. Sofern Sie den Zugriff unterbinden, kann es hierdurch zu Funktionseinschränkungen auf der Website kommen.</p>
          <h3>Widerruf der Einwilligung:</h3>
          <p>Sie können die Speicherung der Cookies durch eine entsprechende Einstellung Ihrer Browser-Software verhindern; wir weisen Sie jedoch darauf hin, dass Sie in diesem Fall gegebenenfalls nicht sämtliche Funktionen dieser Website vollumfänglich werden nutzen können.</p>
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
          <h2>SSL-Verschlüsselung</h2>
          <p>Um die Sicherheit Ihrer Daten bei der Übertragung zu schützen, verwenden wir dem aktuellen Stand der Technik entsprechende Verschlüsselungsverfahren (z. B. SSL) über HTTPS.</p>
          <h2>Änderung unserer Datenschutzbestimmungen</h2>
          <p>Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen in der Datenschutzerklärung umzusetzen, z.B. bei der Einführung neuer Services. Für Ihren erneuten Besuch gilt dann die neue Datenschutzerklärung.</p>
          <p><em>Die Datenschutzerklärung wurde mit dem </em>
            <a 
              href="https://www.activemind.de/datenschutz/datenschutzhinweis-generator/" 
              target="_blank" 
              rel="noopener">
              Datenschutzerklärungs-Generator der activeMind AG erstellt
            </a>
          </p>
          <i>Stand 26.11.2018</i>

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
  name: 'SpluseinsDataPrivacy',
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
