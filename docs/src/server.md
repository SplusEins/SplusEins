# Server

Beim Server bzw. Backend handelt es sich um eine [NodeJS](https://nodejs.org) Anwendung, welche unter Verwendung des Web-Application-Frameworks [ExpressJS](https://expressjs.com) implementiert wurde.
Als Spracherweiterung zu JS wurde [Typescript](https://www.typescriptlang.org) gewwählt.

## Verzeichnisse und Dateien

- `/assets`: beinhaltet die `timetables.json`, eine JSON-Datei welche alle zur Verfügung stehende Pläne enthält
- `/lib`: beinhaltet Implementierung von verschiedenen Tools wie den Parser für die Stundenpläne
- `/controllers`: beinhaltet die Controller für die einzelnen Endpunkte des Servers
- `/model`: beinhaltet die Implementierung des Typescript Interfaces und Klassen
- `/tests`: beinhaltet Unit- und Integrationstests
- `App.ts`: beinhaltet Implementierung der App-Klasse in welcher die verschiedenen Controller integriert werden
- `server.ts`: Skript welcher eine Instanz der App-Klasse erstellt und startet (alternativ siehe: `serverless.ts`)
- `serverless.ts`: Skript welcher eine Instanz der Klasse erstellt, welche kompatibel für der serverlosen Betrieb unter [Netlify](https://www.netlify.com) ist
- `webpack.config.js` Konfigurationsdatei für [Webpack](https://webpack.js.org) für den Build des Servers

# API

Die API des Servers wird grundlegend über die Controller, welche sich im `server/controller` Verzeichnis befinden, beeinflusst.
Bei der API handelt es sich um eine REST-Schnittstelle welche mit dem JSON-Format arbeitet.

## Stundenplan

Die Endpunkte zum Abfragen der Stundenpläne durch das Frontend sind in der Datei `controller/splus.ts` definiert.

### GET `/splus/:timetable/:weeks`

**Parameter:**

- timetable: Stundenplan-ID wie in `assets/timetables.json`
- weeks: Eine oder mehrere durch Komma getrennte Kalenderwochen

**Rückgabe:**
Liefert ein Timetable-Objekt (siehe `model/SplusEinsModel.ts`), welche alle Events (Veranstaltungen) in diesem Plan in den angeforderten Wochen enthält.

**Beispiel:**
`/splus/informatik-wpf/33,34`

### GET `/splus/:timetables/:weeks/:lectures?/:name`

**Parameter:**

- timetables: Eine oder mehrere durch Komma getrennte Stundenplan-IDs wie in `assets/timetables.json`
- weeks: Eine oder mehrere durch Komma getrennte Kalenderwochen
- lectures (optional): Eine oder mehrere durch Komma getrennte Liste von Lecture-IDs wie sie in einem Timetable-Objekt verwendet werden
- name: frei wählbarer Name für einen Stundenplan (für personalierte Pläne)

**Rückgabe:**
Liefert ein Timetable-Objekt (siehe `model/SplusEinsModel.ts`), welche alle Events (Veranstaltungen) oder falls übergeben, nur die angeforderten Veranstaltungen (lectures) enthält.
Der Stundenplan hat den übergebenen Namen.

**Beispiel:**
`/splus/informatik-wpf,informatik-1/33,34/D123A,GA31R/MeinPlan`

### GET `/splus/:timetable/lectures`

**Parameter:**

- timetable: Stundenplan-ID wie in `assets/timetables.json`

**Rückgabe:**
Liefert ein `Event`-Array (siehe `model/SplusEinsModel.ts`), welches aus den einzelnen Vorlesungen dieses Stundenplans besteht. Damit kann herausgefunden werden, welches und wie viele Module es in diesem Plan gibt. Wird im Frontend genutzt, um die Liste zum Personalisieren eines Plans bereitzustellen.

**Beispiel:**
`/splus/informatik-wpf/lectures`

## ICS

Der Endpunkt zum Abfragen der Stundenpläne im [iCalendar](https://de.wikipedia.org/wiki/ICalendar) Format für Kalender-Apps wie Outlook befindet sich in der Datei `controller/ics.ts`.

### GET `/ics/:version/:timetables/:lectures`

**Parameter:**

- version: Versionierung der API, aktuell noch nicht benötigt (zum Beispiel `v1`) verwenden
- timetables: Eine oder mehrere durch Komma getrennte Stundenplan-IDs wie in `assets/timetables.json`
- lectures (optional): Eine oder mehrere durch Komma getrennte Liste von Lecture-IDs wie sie in einem Timetable-Objekt verwendet werden

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
Liefert ein Mensa Objekt mit einem MensaDayPlan-Array (siehe `model/SplusEinsModel.ts`), aus 6 Tagesplänen (falls verfügbar) der aller eingetragenden Mensen. Die Pläne werden von der OpenMensa-API abgerufen.
Die Mensa in Wolfenbüttel besitzt die ID `166`.

## Bus

Der Endpunkt zum Abfragen des Bus-Plans befindet sich in der Datei `controller/bus.ts`.

### GET `/bus`

**Parameter:** keine

**Rückgabe:**
Liefert einen Plan der 5 nächsten Abfahrten des Nahverkehrs in Wolfenbüttel zwischen den Standorten Exer (ID `de-DELFI_de:03158:599:0:1`) und Salzdahlumer Straße (ID `de-DELFI_de:03158:598:0:1`). Die Daten werden mit Hilfe des Motis-Clients und der Transitous-API abgerufen.

## News

Die Endpunkte zum Abfragen der News-Daten befinden sich in der Datei `controller/news.ts`.

### GET `/news/:newstypes?limit=NUMBER`

**Parameter:**

- newstypes: Komma getrennte Liste von News-Quellen. Unterstützte Quellen sind die meisten Fakultäten: `r`, `b`, `k`, `h`, `f`, `g`, `w`, `e`, `s`. Weiterhin unterstützt sind alle Ostfalia-Standorte (`wob`, `wf`, `sud`, `sz`) sowie die Ostfalia-globalen News `campus` und die Campus38-News mittels `campus38`.
- limit: Optional, limitiert die zurückgegebenen News auf diese Anzahl. Maximal zurückgegeben werden die 100 letzten News.

**Rückgabe:**
Liefert ein NewsElement-Array (siehe `model/SplusEinsModel.ts`) mit den ausgewählten News zurück. Die Beschreibungen werden auf 130 Zeichen gekürzt und die News nach Datum sortiert. Einzige Ausnahme bei der Sortierung sind die `campus38`-News. Diese werden etwas geringer gewichtet, da diese deutlich häufiger erscheinen als die sonstigen News.

### GET `/news/:newstypes.rss?limit=NUMBER`

**Parameter:**
Erwartet dieselben Parameter wie die normale News-API.

**Rückgabe:**
Gibt dieselben Daten als RSS-Feed zurück.

## Parser

Der Parser für die Stundenpläne von sked befindet sich im Verzeichnis des Servers unter `/lib/SkedParser.ts`.

In Sked gibt es grundsätzlich drei verschiedene Arten von Stundenplänen. `Listenpläne` als Auflistung der Module, `grafische Pläne` als anschauliche Darstellung (einem Stundenplan nachempfunden) und `CSV-Pläne` (der Fakultät Informatik).
Für alle Versionen hat der Parser eine Implementierung, da es für manche Studiengänge nicht alle Formen gibt.

Die HTML-Parser Funktionen sind `parseSkedList` und `parseSkedGraphical`. Diese erhalten als Übergabeparameter das HTML der Stundenplanseite als String.
Mithilfe der Bibliothek [cheerio](https://cheerio.js.org/) kann auf die einzelnen Tags des HTML zugegriffen werden. Sie bildet die Grundlage des HTML-Parsers.

In beiden Implementierung wird so der Quelltext der Pläne nach den nötigen Informationen durchsucht.
Leider sind nicht alle Pläne gleich aufgebaut:

- Die Listenpläne haben teilweise eine unterschiedliche Anzahl von Spalten, deshalb gibt es im entsprechenden Parser eine Fallunterscheidung.
- Die Texte der Module, welche im grafischen Plan eingetragen sind abhängig von der Fakultät unterschiedlich aufgebaut. So wird als Beispiel manchmal erst der Raum oder erst der Dozent genannt.

Beschäftigt man sich mit dem Parser muss man diese Punkte **zwangsläufig** beachten.

`parseSkedCSV` ist die Funktion für das CSV, hier wird lediglich das CSV eingelesen und anhand der Spaltenüberschriften zugeordnet. Diese Methode ist bevorzugt, da sie am wenigstens Fehler erzeugt.

Alle Implementierung der Parser liefern eine Liste vom Interface _ParsedLecture_ zurück, wie es in `/model/SplusModel.ts` definiert ist.

## Struktur der Stundenpläne

Für jeden Plan muss ein JSON-Objekt in der Datei definiert werden und in `/server/assets/timetables.json` sowie `/web/assets/timetables.json` abgelegt werden.
Diese müssen folgende Struktur besitzen:

```json
{
  "id": "informatik-1",
  "label": "Informatik",
  "faculty": "Informatik",
  "degree": "Bachelor of Science",
  "semester": "1",
  "raumplan": false,
  "type": "list",
  "timetablePath": "https://stundenplan.ostfalia.de/i/Semester/Semester-Liste/I-B.Sc. Informatik 1. Sem.html"
}
```

- `id` ist eine selbstgewählter, lesbarer Identifier welcher im Pfad einer SplusEins URL enthalten ist z.B. `https://spluseins.de/plan/informatik-1`
- `label` ist ein Bezeichner welcher zum Beispiel die Vertiefungsrichtung bzw. Studienrichtung kennzeichnet
- `faculty` gibt die Fakultät an
- `degree` gibt den angestrebten Studienabschluss an
- `semester` gibt über­ra­schen­der­wei­se das Semester an
- `raumplan` ist ein Boolean-Wert welcher angibt, ob es sich um einen Raumplan handelt
- `type` ist ein String welcher angibt, ob es sich um einen grafischen Plan (`graphical`, der häufigste Fall), einen Listenplan (`list`) oder einen CSV-Plan handelt (`csv`)
- `timetablePath` gibt den Pfad an, über welchen der Plan in der Sked Anwendung abgerufen werden kann (z.B. `http://stundenplan.ostfalia.de/i/Semester/Semester-Liste/I-B.Sc. Informatik 1. Sem.html`)
