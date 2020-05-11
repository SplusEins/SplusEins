---
title: Semesterbeginn
---

# Aufgaben zu Semesterbeginn

## Aktualisierung der Pläne

Jedes Semester ändern sich die Pläne in Sked.
Zu Beginn müssen deshalb alle existierenden Pläne manuell herausgesucht und in die Datei `timetables.json` in `server/assets/` und `web/assets/` eingetragen werden.
Oft sind die Pläne in aufeinander folgenden Sommersemestern bzw. Wintersemestern sehr ähnlich. Sie können also teilweise wiederverwendet werden.

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
    "graphical": false,
    "skedPath": "i/Semester/Semester-Liste/I-B.Sc. Informatik 1. Sem.html"
  }
```
* `id` ist eine selbstgewählter, lesbarer Identifier welcher im Pfad einer SplusEins URL enthalten ist z.B. `https://spluseins.de/plan/informatik-1`
* `label` ist ein Bezeichner welcher zum Beispiel die Vertiefungsrichtung bzw. Studienrichtung kennzeichnet
* `faculty` gibt die Fakultät an
* `degree` gibt den angestrebten Studienabschluss an
* `semester` gibt über­ra­schen­der­wei­se das Semester an
* `raumplan` ist ein Boolean-Wert welcher angibt, ob es sich um einen Raumplan handelt
* `graphical` ist ein Boolean-Wert welcher angibt, ob es sich um einen `grafischen Plan` handelt (bei `false` handelt es sich um einen `Listenplan`)
* `skedPath` gibt den Pfad an, über welchen der Plan in der Sked Anwendung abgerufen werden kann (z.B. `http://stundenplan.ostfalia.de/i/Semester/Semester-Liste/I-B.Sc. Informatik 1. Sem.html`)


## Semesterstart setzen

Für das Frontend muss die Umgebungsvariable `SEMESTER_WEEK_1` auf die ISO-Woche der ersten Semesterwoche des aktellen Semesters gesetzt werden. Das Frontend muss neu gebaut werden.
