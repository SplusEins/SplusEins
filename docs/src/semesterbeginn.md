# Wartung

## Aktualisierung der Pläne

Wenn sich die Pläne oder deren URLs ändern, wird automatisch ein PR erstellt, der die Datei `assets/timetables.json` (sowohl in `/web` als auch `/server`) aktualisiert. Dieser PR sollte grob überprüft werden und zeitnah gemerged werden.

Für diese Aktualisierung wird [sked_parser](https://github.com/SplusEins/sked_parser) verwendet. Der Aufbau der `timetables.json` ist [hier](./server.md#struktur-der-stundenplane) beschrieben.

::: tip
Bei Semesterbeginn sollte darauf geachtet werden, dass möglicherweise noch alte Stundenplane in dem PR enthalten sind, wenn einige Fakultäten die neuen Stundenpläne noch nicht veröffentlicht haben und andere schon (gerade Informatik ist häufig später dran als andere).

Dann kann es sinnvoll sein, die alten Pläne aus dem PR manuell zu entfernen und dann zu mergen. Oder man wartet, bis alle Fakultäten ihre Pläne veröffentlicht haben, das dauert aber meist ziemlich lange.
:::

## Aufgaben zu Semesterbeginn

Alle relevanten Stellen im Code können auch gefunden werden, indem man nach `TODO Semesterwechsel` sucht. Im Folgenden werden diese kurz beschrieben.

### Semesterstart setzen

Im Frontend muss gesetzt werde, welche Woche die erste Vorlesungswoche ist. Das wird in der Variable `SEMESTER_WEEK_1` in [`web/store/splus.js`](https://github.com/SplusEins/SplusEins/blob/master/web/store/splus.js) gesetzt. Der Vorlesungsbeginn der Ostfalia wird in [diesem PDF](https://www.ostfalia.de/cms/de/ostfalia/semestertermine/) veröffentlicht, woraus man die ISO-Woche berechnen kann.

### `sked-parser` Konfiguration aktualisieren

Die oben erwähnte Aktualisierung der Pläne nutzt die Datei [`timetable-config.yaml`](https://github.com/SplusEins/SplusEins/blob/master/timetable-config.yaml) als Konfiguration. Zu Semesterstart muss diese Datei aktualisiert werden:

1. Der String für das aktuelle Semester muss aktualisiert werden.
2. Die Blacklist Strings müssen aktualisiert werden. Diese sollten den Namen des vorherigen Semesters in unterschiedlichen Variationen enthalten (da einige Fakultäten die Stundenpläne des vorherigen Semesters manchmal nicht richtig löschen).
3. Die Stundenplan-URLs in der Datei sollten überprüft werden, ob diese noch aktuell sind. Die Übersichtsseite der Ostfalia findet sich [hier](https://stundenplan.ostfalia.de).

::: tip
Die tägliche Github Action, die den PR erstellt, kann auch [hier](https://github.com/SplusEins/SplusEins/actions/workflows/timetables.yml) mit `Run workflow` manuell ausgeführt werden, um die veränderte Konfiguration zu überprüfen.
:::

### Überprüfen der einzelnen Stundenpläne

Zu Semesterbeginn sollte zudem von jeder Fakultät mindestens ein Stundenplan in der UI angeschaut werden, um zu überprüfen, dass die Daten richtig geparst wurden. Wichtig ist, dass die Dozierenden richtig geparst werden und zensiert angezeigt werden. Außerdem sollte der Raumname richtig angezeigt werden.

Wenn in Spluseins gar keine Vorlesungen angezeigt werden, bei der Ostfalia aber schon, kann es sein, dass der serverseitige Parser [in dieser Datei](https://github.com/SplusEins/SplusEins/blob/master/server/lib/SkedParser.ts) angepasst werden muss, das ist aber eher selten der Fall.

### Gespeicherte Pläne löschen

Zudem muss bei dem `vuex-persist`-Plugin die Storage-Version erhöht werden, damit Pläne des vorherigen Semesters aus dem Local Storage der Nutzer gelöscht werden. Dies passiert in [`web/plugins/vuex-persist.js`](https://github.com/SplusEins/SplusEins/blob/master/web/plugins/vuex-persist.js), die Zeilen sind mit TODOs markiert.

## Aktualisierung der Dependencies

Der `renovate`-Bot öffnet automatisch PRs, sobald es Updates für Dependencies gibt. Diese können einfach gemerged werden, solange im Changelog in der PR-Beschreibung keine kritischen Breaking Changes angezeigt werden.
