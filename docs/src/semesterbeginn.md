# Wartung

## Semesterbeginn

Anders als früher ist zum Semesterwechsel keine manuelle Anpassung mehr nötig. `sked-parser` leitet das Semester aus dem Datum ab (ab Februar `ss{yy}`, ab August `ws{yy}`) und überspringt Pläne anderer Semester. Es muss nur der PR mit den neuen Plänen gemerged werden, siehe [Aktualisierung der Pläne](#aktualisierung-der-plane).

Danach sollte von jeder Fakultät mindestens ein Stundenplan in der UI angeschaut werden: Sind alle Fakultäten und Studiengänge da, werden die Dozierenden zensiert und die Räume richtig angezeigt? Fehlen Pläne, ist eventuell eine Übersichts-URL in [`timetable-config.yaml`](https://github.com/SplusEins/SplusEins/blob/master/timetable-config.yaml) veraltet. Zeigt SplusEins gar keine Vorlesungen, die Ostfalia aber schon, muss eventuell der [Parser](https://github.com/SplusEins/SplusEins/blob/master/server/lib/SkedParser.ts) angepasst werden.

## Aktualisierung der Pläne

Ändern sich die Pläne oder deren URLs, erstellt eine tägliche GitHub Action mit [sked_parser](https://github.com/SplusEins/sked_parser) einen PR, der `assets/timetables.json` in `/web` und `/server` aktualisiert. Er sollte grob überprüft und zeitnah gemerged werden. Der Aufbau der `timetables.json` ist [hier](./server.md#struktur-der-stundenplane) beschrieben.

Zu Semesterbeginn kann der PR noch alte Pläne von Fakultäten enthalten, die ihre neuen noch nicht veröffentlicht haben. Die ersetzt der Bot nach und nach.

::: tip
Die Action kann [hier](https://github.com/SplusEins/SplusEins/actions/workflows/timetables.yml) mit `Run workflow` manuell gestartet werden. In Forks braucht sie `OSTFALIA_USER` und `OSTFALIA_PASS` als [Repository Secrets](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets#creating-secrets-for-a-repository), sonst kann sie nur die Pläne der Fakultät I abrufen.
:::

## Aktualisierung der Dependencies

Der `renovate`-Bot öffnet PRs für Updates. Sie können gemerged werden, solange der Changelog in der PR-Beschreibung keine kritischen Breaking Changes zeigt.

## Updates auf dem Ubuntu-Server

Der Server der Fakultät I sollte gelegentlich mit `apt-get dist-upgrade` aktualisiert werden, Sicherheitsupdates installiert er automatisch. Abfragen vom `dokku`-Paket können meist mit dem Default bestätigt werden, danach muss der Server neu gestartet werden, damit SplusEins wieder läuft. Alle paar Jahre muss außerdem die Ubuntu-Version mit `do-release-upgrade` aktualisiert werden.
