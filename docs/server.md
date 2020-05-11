---
title: Server
---
# Server

Beim Server bzw. Backend handelt es sich um eine [NodeJS](https://nodejs.org) Anwendung, welche unter Verwendung des Web-Application-Frameworks [ExpressJS](https://expressjs.com) implementiert wurde.
Als Spracherweiterung zu JS wurde [Typescript](https://www.typescriptlang.org) gewwählt.

## Verzeichnisse und Dateien

  * `/assets`: beinhaltet die `timetables.json`, eine JSON-Datei welche alle zur Verfügung stehende Pläne enthält
  * `/lib`: beinhaltet Implementierung von verschiedenen Tools wie den Parser für die Stundenpläne
  * `/controllers`: beinhaltet die Controller für die einzelnen Endpunkte des Servers
  * `/model`: beinhaltet die Implementierung des Typescript Interfaces und Klassen
  * `/tests`: beinhaltet Unit- und Integrationstests
  * `App.ts`: beinhaltet Implementierung der App-Klasse in welcher die verschiedenen Controller integriert werden
  * `server.ts`: Skript welcher eine Instanz der App-Klasse erstellt und startet (alternativ siehe: `serverless.ts`)
  * `serverless.ts`: Skript welcher eine Instanz der Klasse erstellt, welche kompatibel für der serverlosen Betrieb unter [Netlify](https://www.netlify.com) ist
  * `webpack.config.js` Konfigurationsdatei für [Webpack](https://webpack.js.org) für den Build des Servers

# API

Die API des Servers wird grundlegend über die Controller, welche sich im `server/controller` Verzeichnis befinden, beeinflusst.
Bei der API handelt es sich um eine REST-Schnittstelle welche mit dem JSON-Format arbeitet.

## Stundenplan
Die Endpunkte zum Abfragen der Stundenpläne durch das Frontends sind in der Datei `controller/splus.ts` definiert.

### GET `/splus/:timetable/:weeks`
**Parameter:**
  * timetable: Stundenplan-ID wie in `assets/timetables.json`
  * weeks: Eine oder mehrere durch Komma getrennte Kalenderwochen

**Rückgabe:**
  Liefert ein Timetable-Objekt (siehe `model/SplusEinsModel.ts`), welche alle Events (Verstanstaltungen) in diesem Plan in den angeforderten Wochen enthält.

**Beispiel:**
  `/splus/informatik-wpf/33,34`

### GET `/splus/:timetables/:weeks/:lectures?/:name`
**Parameter:**
  * timetables: Eine oder mehrere durch Komma getrennte Stundenplan-IDs wie in `assets/timetables.json`
  * weeks: Eine oder mehrere durch Komma getrennte Kalenderwochen
  * lectures (optional): Eine oder mehrere durch Komma getrennte Liste von Lecture-IDs wie sie in einem Timetable-Objekt verwendet werden
  * name: frei wählbarer Name für einen Stundenplan (für personalierte Pläne)

**Rückgabe:**
  Liefert ein Timetable-Objekt (siehe `model/SplusEinsModel.ts`), welche alle Events (Verstanstaltungen) oder falls übergeben, nur die angeforderten Veranstaltungen (lectures) enthält.
  Der Stundenplan hat den übergebenen Namen.

**Beispiel:**
  `/splus/informatik-wpf,informatik-1/33,34/D123A,GA31R/MeinPlan`

## ICS
Der Endpunkt zum Abfragen der Stundenpläne im [iCalendar](https://de.wikipedia.org/wiki/ICalendar) Format für Kalender-Apps wie Outlook befindet sich in der Datei `controller/ics.ts`.

### GET `/ics/:version/:timetables/:lectures`
**Parameter:**
  * version: Versionierung der API, aktuell noch nicht benötigt (zum Beispiel `v1`) verwenden
  * timetables: Eine oder mehrere durch Komma getrennte Stundenplan-IDs wie in `assets/timetables.json`
  * lectures (optional): Eine oder mehrere durch Komma getrennte Liste von Lecture-IDs wie sie in einem Timetable-Objekt verwendet werden

**Rückgabe:**
  Liefert eine ICS-Datei aus, welche alle Events (Verstanstaltungen) oder falls übergeben, nur die angeforderten Veranstaltungen (lectures) enthält.
  Die Anzahl der Wochen wird über die Umgebungsvariable `ICS_PRELOAD_WEEKS` bestimmt. Der Standardwert liegt bei 4 Wochen.

**Beispiel:**
  `/ics/v1/informatik-wpf,informatik-1/D123A,GA31R`

## Mensa
Der Endpunkt zum Abfragen der Mensa-Plan Daten befindet sich in der Datei `controller/mensa.ts`.

### GET `/mensa`
**Parameter:** keine

**Rückgabe:**
  Liefert ein MensaDayPlan-Array (siehe `model/SplusEinsModel.ts`), aus 6 Tagesplänen (falls verfügbar) der Mensa in Wolfenbüttel. Die Pläne werden von der OpenMensa-API abgerufen.
  Die Mensa in Wolfenbüttel besitzt die ID `166`.

## Bus
Der Endpunkt zum Abfragen des Bus-Plans befindet sich in der Datei `controller/bus.ts`.

### GET `/bus`
**Parameter:** keine

**Rückgabe:**
  Liefert einen Plan der 5 nächsten Abfahrten des Nahverkehrs in Wolfenbüttel zwischen den Standorten Exer (ID `891011`) und Salzdahlumer Straße (ID `891038`). Die Daten werden mit Hilfe des Hafas-Client von der Deutschen Bahn bezogen.

## News
Die Endpunkte zum Abfragen der News-Daten befinden sich in der Datei `controller/news.ts`.

### GET `/news/campus`
**Parameter:** keine

**Rückgabe:**
  Liefert ein NewsElement-Array (siehe `model/SplusEinsModel.ts`), welches allgemeine Neuigkeiten über die Ostfalia enthält. Die Daten werden von der Ostfalia Website und von Campus38 bezogen.

### GET `/news/faculty`
**Parameter:** keine

**Rückgabe:**
  Liefert ein NewsElement-Array (siehe `model/SplusEinsModel.ts`), welches Neuigkeiten der Fakultäten Informatik, Recht und E-Technik sowie den Standorten Wolfenbüttel, Wolfsburg und Suderburg enthält. Die Daten stammen von den jeweiligen Ostfalia-Webseiten.

## Parser
Der Parser für die Stundenpläne von sked befindet sich im Verzeichnis des Servers unter `/lib/SkedParser.ts`.

In Sked gibt es grundsätzlich zwei verschiedene Arten von Stundenplänen. Zum einen `Listenpläne` (Auflistung der Module) und zum anderen `grafische Pläne` (anschauliche Darstellung).
Für beide Versionen hat der Parser eine Implementierung da es für manche Studiengänge manchmal nur eine der beiden gibt.
Sie Funktionen heißen `parseSkedList` und `parseSkedGraphical`. Diese erhalten als Übergabeparameter das HTML der Stundenplanseite als String und die gewünschte Woche als Zahl.
Mit Hilfe der Bibliothek [cheerio](https://cheerio.js.org/) kann auf die einzelnen Tags des HTML zugegriffen werden. Sie bildet die Grundlage des Parsers.

In beiden Implementierung wird so der Quelltext der Pläne nach den nötigen Informationen durchsucht.
Leider sind nicht alle Pläne gleich aufgebaut:
  * Die Listenpläne haben teilweise eine unterschiedliche Anzahl von Spalten, deshalb gibt es im entsprechenden Parser eine Fallunterscheidung.
  * Die Texte der Module, welche im grafischen Plan eingetragen sind abhängig von der Fakultät unterschiedlich aufgebaut. So wird als Beispiel manchmal erst der Raum oder erst der Dozent genannt.

Beschäftigt man sich mit dem Parser muss man diese Punkte **zwangsläufig** beachten.

Beide Implementierung des Parser liefern eine Liste vom Interface *ParsedLecture* zurück wie es in `/model/SplusModel.ts` definiert ist.