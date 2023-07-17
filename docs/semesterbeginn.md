---
title: Semesterbeginn
---

# Aufgaben zu Semesterbeginn

## Aktualisierung der Pläne

Jedes Semester ändern sich die Pläne in Sked. Zu Beginn müssen deshalb alle existierenden Pläne herausgesucht und in die Datei `timetables.json` in `server/assets/` und `web/assets/` eingetragen werden.

::: tip
Um diesen Vorgang zu vereinfachen, wurde [`sked-parser`](https://github.com/SplusEins/sked_parser) geschrieben, welches die notwendige `timetables.json` erstellt. In der README des Projektes befindet sich eine ausführliche Erklärung.
:::

Für jeden Plan muss ein JSON-Objekt in der Datei definiert werden.
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
  "skedPath": "i/Semester/Semester-Liste/I-B.Sc. Informatik 1. Sem.html"
}
```

- `id` ist eine selbstgewählter, lesbarer Identifier welcher im Pfad einer SplusEins URL enthalten ist z.B. `https://spluseins.de/plan/informatik-1`
- `label` ist ein Bezeichner welcher zum Beispiel die Vertiefungsrichtung bzw. Studienrichtung kennzeichnet
- `faculty` gibt die Fakultät an
- `degree` gibt den angestrebten Studienabschluss an
- `semester` gibt über­ra­schen­der­wei­se das Semester an
- `raumplan` ist ein Boolean-Wert welcher angibt, ob es sich um einen Raumplan handelt
- `type` ist ein String welcher angibt, ob es sich um einen grafischen Plan (`graphical`, der häufigste Fall), einen Listenplan (`list`) oder einen CSV-Plan handelt (`csv`)
- `skedPath` gibt den Pfad an, über welchen der Plan in der Sked Anwendung abgerufen werden kann (z.B. `http://stundenplan.ostfalia.de/i/Semester/Semester-Liste/I-B.Sc. Informatik 1. Sem.html`)

Siehe auch [Erklärungen zum serverseitigen Parser](./server.md#parser).

## Semesterstart setzen

Für das Frontend muss die Variable `SEMESTER_WEEK_1` in [`web/store/splus.js`](https://github.com/SplusEins/SplusEins/blob/master/web/store/splus.js) auf die ISO-Woche der ersten Semesterwoche des aktuellen Semesters gesetzt werden. Der Beginn der Vorlesungen wird in [diesem PDF](https://www.ostfalia.de/cms/de/ostfalia/semestertermine/) veröffentlicht.

Zudem muss für das `vuex-persist`-Plugin die Storage-Version erhöht werden, damit alte (personalisierte) Pläne des vorherigen Semesters aus dem `Local Storage` der Nutzer gelöscht werden. Dies passiert in [`web/plugins/vuex-persist.js`](https://github.com/SplusEins/SplusEins/blob/master/web/plugins/vuex-persist.js), die Zeilen sind mit TODOs markiert.
