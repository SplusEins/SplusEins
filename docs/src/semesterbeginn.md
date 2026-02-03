# Wartung

## Aufgaben zu Semesterbeginn

Alle relevanten Stellen im Code können auch gefunden werden, indem man nach `TODO Semesterwechsel` sucht. Im Folgenden werden diese kurz beschrieben.

### Semesterstart setzen

Im Frontend muss gesetzt werde, welche Woche die erste Vorlesungswoche ist. Das wird in der Variable `SEMESTER_WEEK_1` in [`web/lib/util.js`](https://github.com/SplusEins/SplusEins/blob/master/web/lib/util.js#L9) gesetzt. Der Vorlesungsbeginn der Ostfalia wird auf [dieser Seite](https://www.ostfalia.de/studieren/im-studium/studienorganisation/semestertermine) veröffentlicht, woraus man die ISO-Woche berechnen kann.

### `sked-parser` Konfiguration aktualisieren

Die oben erwähnte Aktualisierung der Pläne nutzt die Datei [`timetable-config.yaml`](https://github.com/SplusEins/SplusEins/blob/master/timetable-config.yaml) als Konfiguration. Zu Semesterstart muss diese Datei aktualisiert werden:

1. Der String für das aktuelle Semester muss aktualisiert werden.
2. Die Blacklist Strings müssen aktualisiert werden. Diese sollten den Namen des vorherigen Semesters in unterschiedlichen Variationen enthalten (da einige Fakultäten die Stundenpläne des vorherigen Semesters manchmal nicht richtig löschen).
3. Optional: Die Stundenplan-URLs in der Datei sollten überprüft werden, ob diese noch aktuell sind. Die Übersichtsseite der Ostfalia findet sich [hier](https://stundenplan.ostfalia.de).

::: tip
Die tägliche Github Action, die den PR erstellt, kann auch [hier](https://github.com/SplusEins/SplusEins/actions/workflows/timetables.yml) mit `Run workflow` manuell ausgeführt werden, um die veränderte Konfiguration zu überprüfen. 

<u>**Wichtig für Forks:**</u> Für die erfolgreiche Ausführung der Action ist das Hinterlegen von `SKED_USER` und `SKED_PASSWORD` als [Repository Secrets](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets#creating-secrets-for-a-repository) mit validen Ostfalia-Accountdaten im Fork zwingend erforderlich. Ohne diese Secrets können ausschließlich Pläne der Fakultät I abgerufen werden, da hierfür keine Authentifizierung notwendig ist.
:::

### Gespeicherte Pläne löschen

Zudem muss bei dem `vuex-persist`-Plugin die Storage-Version erhöht werden, damit Pläne des vorherigen Semesters aus dem Local Storage der Nutzer gelöscht werden. Dies passiert in [`web/plugins/vuex-persist.js`](https://github.com/SplusEins/SplusEins/blob/master/web/plugins/vuex-persist.js), die Zeilen sind mit TODOs markiert.

### Überprüfen der einzelnen Stundenpläne

Zu Semesterbeginn sollte im besten Fall von jeder Fakultät mindestens ein Stundenplan in der UI angeschaut werden. Wichtig ist, dass die Dozierenden richtig geparst werden und zensiert angezeigt werden. Außerdem sollte der Raumname richtig angezeigt werden.

Wenn in Spluseins gar keine Vorlesungen angezeigt werden, bei der Ostfalia aber schon, kann es sein, dass der serverseitige Parser [in dieser Datei](https://github.com/SplusEins/SplusEins/blob/master/server/lib/SkedParser.ts) angepasst werden muss, das ist aber eher selten der Fall.

## Aktualisierung der Pläne

Wenn sich die Pläne oder deren URLs ändern, wird automatisch ein PR erstellt, der die Datei `assets/timetables.json` (sowohl in `/web` als auch `/server`) aktualisiert. Dieser PR sollte grob überprüft werden und zeitnah gemerged werden.

Für diese Aktualisierung wird [sked_parser](https://github.com/SplusEins/sked_parser) verwendet. Der Aufbau der `timetables.json` ist [hier](./server.md#struktur-der-stundenplane) beschrieben.

::: tip
Bei Semesterbeginn sind möglicherweise noch alte Stundenplane in dem PR enthalten sind, wenn einige Fakultäten die neuen Stundenpläne noch nicht veröffentlicht haben und andere schon.

Dann kann es sinnvoll sein, die alten Pläne aus dem PR manuell zu entfernen und dann zu mergen. Es ist aber auch okay, einfach die alten erstmal mit zu mergen und dann nach und nach durch den Bot ersetzen zu lassen.
:::

## Aktualisierung der Dependencies

Der `renovate`-Bot öffnet automatisch PRs, sobald es Updates für Dependencies gibt. Diese können einfach gemerged werden, solange im Changelog in der PR-Beschreibung keine kritischen Breaking Changes angezeigt werden.

## Updates auf dem Ubuntu-Server

Der Ubuntu-Server, der uns von der Fakultaet I zur Verfuegung gestellt wird, sollte auch gelegentlich aktualisiert werden. Dies kann mit dem Befehl `apt-get dist-upgrade` geschehen. Sicherheitsupdates werden allerdings automatisch installiert, weshalb das nicht sehr regelmaessig geschehen muss.

Falls irgendwelche Abfragen vom `dokku`-Paket kommen, koennen diese in der Regel einfach mit dem Default bestaetigt werden. Nach dem Upgrade muss der Server wegen `dokku` in der Regel neugestartet werden, damit SplusEins wieder funktioniert.

Ausserdem muss alle paar Jahre die Ubuntu-Version mit dem Befehl `do-release-upgrade` aktualisiert werden.
