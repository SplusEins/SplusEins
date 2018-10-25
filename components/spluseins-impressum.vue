<template>
  <div class="text-xs-center">
    <v-dialog
      v-model="active"
      width="800"
    >
      <v-card>
        <v-card-title
          class="headline black white--text"
          primary-title
        >
          Impressum
        </v-card-title>

        <v-card-text>
          <p style="margin-bottom: 12.0pt; line-height: 18.0pt; text-autospace: none;"><span style="font-size: 14pt; font-family: arial, helvetica, sans-serif; color: black;">Angaben gemä&szlig; &sect; 5 TMG </span></p>
          <p style="margin-bottom: 12.0pt; line-height: 18.0pt; text-autospace: none;"><span style="font-size: 14pt; font-family: arial, helvetica, sans-serif; color: black;">SplusEins Team </span></p>
          <p style="margin-bottom: 12.0pt; line-height: 18.0pt; text-autospace: none;"><span style="font-family: arial, helvetica, sans-serif;"><span style="font-size: 14pt; color: black;">Am Exer 2</span></span></p>
          <p style="margin-bottom: 12.0pt; line-height: 18.0pt; text-autospace: none;"><span style="font-size: 14pt; font-family: arial, helvetica, sans-serif; color: black;">38302 Wolfenbüttel </span></p>
          <p style="margin-bottom: 12.0pt; line-height: 18.0pt; text-autospace: none;"><span style="font-family: arial, helvetica, sans-serif;"><strong><span style="font-size: 14pt; color: black;">Vertreten durch: </span></strong></span></p>
          <p style="margin-bottom: 12.0pt; line-height: 18.0pt; text-autospace: none;"><span style="font-family: arial, helvetica, sans-serif;"><span style="font-size: 14pt; color: black;">Finn Kaiser</span></span></p>
          <p style="margin-bottom: 12.0pt; line-height: 18.0pt; text-autospace: none;"><span style="font-family: arial, helvetica, sans-serif;"><span style="font-size: 14pt; color: black;">Jan Fasel</span></span></p>
          <p style="margin-bottom: 12.0pt; line-height: 18.0pt; text-autospace: none;"><span style="font-size: 14pt; font-family: arial, helvetica, sans-serif; color: black;">Fabain Pfütsch </span></p>
          <p style="margin-bottom: 12.0pt; line-height: 18.0pt; text-autospace: none;"><span style="font-size: 14pt; font-family: arial, helvetica, sans-serif; color: black;">Timo Haumann</span></p>
          <p style="margin-bottom: 12.0pt; line-height: 18.0pt; text-autospace: none;"><span style="font-family: arial, helvetica, sans-serif;"><strong><span style="font-size: 14pt; color: black;">Kontakt: </span></strong></span></p>
          <p style="margin-bottom: 12.0pt; line-height: 18.0pt; text-autospace: none;"><span style="font-family: arial, helvetica, sans-serif;"><span style="font-size: 14pt; color: black;">E-Mail: </span><span style="font-size: 14pt; color: blue;">team@spluseins.de </span><strong><span style="font-size: 14pt; color: black;">Haftungsausschluss: Haftung für Inhalte </span></strong></span></p>
          <p style="margin-bottom: 12.0pt; line-height: 18.0pt; text-autospace: none;"><span style="font-size: 14pt; font-family: arial, helvetica, sans-serif; color: black;">Die Inhalte unserer Seiten wurden mit grö&szlig;ter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemä&szlig; &sect; 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach &sect;&sect; 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen. </span></p>
          <p style="margin-bottom: 12.0pt; line-height: 18.0pt; text-autospace: none;"><span style="font-family: arial, helvetica, sans-serif;"><strong><span style="font-size: 14pt; color: black;">Haftung für Links </span></strong></span></p>
          <p style="margin-bottom: 12.0pt; line-height: 18.0pt; text-autospace: none;"><span style="font-size: 14pt; font-family: arial, helvetica, sans-serif; color: black;">Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstö&szlig;e überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen. </span></p>
          <p style="margin-bottom: 12.0pt; line-height: 18.0pt; text-autospace: none;"><span style="font-family: arial, helvetica, sans-serif;"><strong><span style="font-size: 14pt; color: black;">Urheberrecht </span></strong></span></p>
          <p style="margin-bottom: 12.0pt; line-height: 18.0pt; text-autospace: none;"><span style="font-size: 14pt; font-family: arial, helvetica, sans-serif; color: black;">Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung au&szlig;erhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen </span></p>
          <p style="line-height: 14.0pt; text-autospace: none;"><span style="font-family: arial, helvetica, sans-serif; color: black;">&nbsp;</span></p>
          <p style="margin-bottom: 12.0pt; line-height: 18.0pt; text-autospace: none;"><span style="font-size: 14pt; font-family: arial, helvetica, sans-serif; color: black;">Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen. </span></p>
          <p style="margin-bottom: 12.0pt; line-height: 18.0pt; text-autospace: none;"><span style="font-family: arial, helvetica, sans-serif;"><strong><span style="font-size: 14pt; color: black;">Datenschutz </span></strong></span></p>
          <p style="margin-bottom: 12.0pt; line-height: 18.0pt; text-autospace: none;"><span style="font-family: arial, helvetica, sans-serif;"><span style="font-size: 14pt; color: black;">Die Nutzung unserer Webseite ist in der Regel ohne Angabe personenbezogener Daten möglich. Soweit auf unseren Seiten personenbezogene Daten (beispielsweise Name, Anschrift oder eMail-Adressen) erhoben werden, erfolgt dies, soweit möglich, stets auf freiwilliger Basis. Diese Daten werden ohne Ihre ausdrückliche Zustimmung nicht an Dritte weitergegeben.</span><span style="font-size: 14pt; color: black;">Wir weisen darauf hin, dass die Datenübertragung im Internet (z.B. bei der Kommunikation per E-Mail) Sicherheitslücken aufweisen kann. Ein lückenloser Schutz der Daten vor dem Zugriff durch Dritte ist nicht möglich.</span><span style="font-size: 14pt; color: black;">Der Nutzung von im Rahmen der Impressumspflicht veröffentlichten Kontaktdaten durch Dritte zur übersendung von nicht ausdrücklich angeforderter Werbung und Informationsmaterialien wird hiermit ausdrücklich widersprochen. Die Betreiber der Seiten behalten sich ausdrücklich rechtliche Schritte im Falle der unverlangten Zusendung von Werbeinformationen, etwa durch Spam-Mails, vor. </span></span></p>
          <p style="margin-bottom: 12.0pt; line-height: 18.0pt; text-autospace: none;"><span style="font-family: arial, helvetica, sans-serif;"><strong><span style="font-size: 14pt; color: black;">Google Analytics </span></strong></span></p>
          <p style="margin-bottom: 12.0pt; line-height: 18.0pt; text-autospace: none;"><span style="font-size: 14pt; font-family: arial, helvetica, sans-serif; color: black;">Diese Website benutzt Google Analytics, einen Webanalysedienst der Google Inc. (''Google''). Google Analytics verwendet sog. ''Cookies'', Textdateien, die auf Ihrem Computer gespeichert werden und die eine Analyse der Benutzung der Website durch Sie ermöglicht. Die durch den Cookie erzeugten Informationen über Ihre Benutzung dieser Website (einschlie&szlig;lich Ihrer IP- Adresse) wird an einen Server von Google in den USA übertragen und dort gespeichert. Google wird diese Informationen benutzen, um Ihre Nutzung der Website auszuwerten, um Reports über die Websiteaktivitäten für die Websitebetreiber zusammenzustellen und um weitere mit der Websitenutzung und der Internetnutzung verbundene Dienstleistungen zu erbringen. Auch wird Google diese Informationen gegebenenfalls an Dritte übertragen, sofern dies gesetzlich vorgeschrieben oder soweit Dritte diese Daten im Auftrag von Google verarbeiten. Google wird in keinem Fall Ihre IP-Adresse mit anderen Daten der Google in Verbindung bringen. Sie können die Installation der Cookies durch eine entsprechende Einstellung Ihrer Browser Software verhindern; wir weisen Sie jedoch darauf hin, dass Sie in diesem Fall gegebenenfalls nicht sämtliche Funktionen dieser Website voll umfänglich nutzen können. Durch die Nutzung dieser Website erklären Sie sich mit der Bearbeitung der über Sie erhobenen Daten durch Google in der zuvor beschriebenen Art und Weise und zu dem zuvor benannten Zweck einverstanden. </span></p>
          <p style="margin-bottom: 12.0pt; line-height: 18.0pt; text-autospace: none;"><span style="font-family: arial, helvetica, sans-serif;"><strong><span style="font-size: 14pt; color: black;">Google AdSense </span></strong></span></p>
          <p style="margin-bottom: 12.0pt; line-height: 18.0pt; text-autospace: none;"><span style="font-size: 14pt; font-family: arial, helvetica, sans-serif; color: black;">Diese Website benutzt Google Adsense, einen Webanzeigendienst der Google Inc., USA (''Google''). Google Adsense verwendet sog. ''Cookies'' (Textdateien), die auf Ihrem Computer gespeichert werden und die eine Analyse der Benutzung der Website durch Sie ermöglicht. Google Adsense verwendet auch sog. ''Web Beacons'' (kleine unsichtbare Grafiken) zur </span></p>
          <p style="margin-bottom: 12.0pt; line-height: 18.0pt; text-autospace: none;"><span style="font-size: 14pt; font-family: arial, helvetica, sans-serif; color: black;">Sammlung von Informationen. Durch die Verwendung des Web Beacons können einfache Aktionen wie der Besucherverkehr auf der Webseite aufgezeichnet und gesammelt werden. Die durch den Cookie und/oder Web Beacon erzeugten Informationen über Ihre Benutzung dieser Website (einschlie&szlig;lich Ihrer IP-Adresse) werden an einen Server von Google in den USA übertragen und dort gespeichert. Google wird diese Informationen benutzen, um Ihre Nutzung der Website im Hinblick auf die Anzeigen auszuwerten, um Reports über die Websiteaktivitäten und Anzeigen für die Websitebetreiber zusammenzustellen und um weitere mit der Websitenutzung und der Internetnutzung verbundene Dienstleistungen zu erbringen. Auch wird Google diese Informationen gegebenenfalls an Dritte übertragen, sofern dies gesetzlich vorgeschrieben oder soweit Dritte diese Daten im Auftrag von Google verarbeiten. Google wird in keinem Fall Ihre IP-Adresse mit anderen Daten der Google in Verbindung bringen. Das Speichern von Cookies auf Ihrer Festplatte und die Anzeige von Web Beacons können Sie verhindern, indem Sie in Ihren Browser-Einstellungen ''keine Cookies akzeptieren'' wählen (Im MS Internet-Explorer unter ''Extras &gt; Internetoptionen &gt; Datenschutz &gt; Einstellung''; im Firefox unter ''Extras &gt; Einstellungen &gt; Datenschutz &gt; Cookies''); wir weisen Sie jedoch darauf hin, dass Sie in diesem Fall gegebenenfalls nicht sämtliche Funktionen dieser Website voll umfänglich nutzen können. Durch die Nutzung dieser Website erklären Sie sich mit der Bearbeitung der über Sie erhobenen Daten durch Google in der zuvor beschriebenen Art und Weise und zu dem zuvor benannten Zweck einverstanden. </span></p>
          <p style="margin-bottom: 12.0pt; line-height: 18.0pt; text-autospace: none;"><span style="font-family: arial, helvetica, sans-serif;"><span style="font-size: 14pt; color: black;">Website Impressum von </span><span style="font-size: 14pt; color: blue;">impressum-generator.de </span></span></p>
          <p style="line-height: 14.0pt; text-autospace: none;"><span style="font-family: arial, helvetica, sans-serif; color: black;">&nbsp;</span></p>
          <p>&nbsp;</p>
        </v-card-text>

        <v-divider/>

        <v-card-actions>
          <v-spacer/>
          <v-btn
            flat
            depressed
            white
            outline
            @click="$emit('close')"
          >
            Schließen
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>		


 <script>

 export default {
   name: 'SpluseinsImpressum',
   props: {
     active : {
       type: Boolean,
       default: false
     }
   },
   data () {
     return {
     }
   }
 }
 </script>


 <style scoped lang="scss">
 .githubIcon {
   padding: 5px 10px 0 5px

 }

 a{
   color: white;
 }
 </style> 
