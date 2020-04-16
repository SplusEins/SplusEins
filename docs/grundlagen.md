---
title: Grundlagen
---
# Grundlagen

## Architektur
Die Anwendung wurde nach dem Client-Server Modell entwickelt. Der Client (Frontend) ist eine VueJS Anwendung welche sich im Ordner `web` befindet. Der Server (Backend) ist eine ExpressJS Anwendung und befindet sich im Ordner `server`. Das Frontend kommuniziert mit dem Backend über eine REST-API mithilfe des HTTP Protokolls.

## Funktionen

### Stundenplan
SplusEins wurde entwickelt, als die Hochschule als Stundenplananwendung das System Splus verwendet hat und wurde nach dem Umstieg auf [Sked](https://stundenplan.ostfalia.de/) im Sommersemester 2020 angepasst.

Das Grundprinizip der Anwendung ist wie folgt: Dem Client liegt eine Liste von verfügbaren Stundenplänen vor. Sobald einer dieser Pläne abgerufen wird, wird eine Anfrage an das Backend gestellt. Dieses verfügt über einen Cache mit konfigurierbarer Caching-Dauer. Sind die benötigten Daten im Cache vorhanden werden diese an den Client zurückgeliefert. Ist das nicht der Fall ruft der Server den angefragten Stundenplan von Sked ab. Von Sked erhält das Backend eine HTML, welche im Anschluss mithilfe eines Parsers nach den relevanten Informationen durchsucht wird. Falls dieser Prozess erfolgreich durchgeführt werden konnte, werden die Daten im Cache gespeichert und dann an den Client versendet.

### Mensaplan
Die Anwendung kann den Mensplan des Standortes Wolfenbüttel darstellen. Dazu werden die Informationen der [OpenMensa-API](https://openmensa.org/) verwendet. Sobald im Frotnend der Mensaplan abgerufen wird, wird diese Anfrage an den Server weitergeleitet. Auch für die Mensaplan-Informationen liegt ein Caching-Mechanismus vor. Sind die Daten im Cache vorhanden werden diese sofort an den Client zurückgeliefert. Andernfalls wird eine Anfrage an die OpenMensa-API gestellt und der neuste Mensplan für den Standort Wolfenbüttel abgerufen sowie im Anschluss an den Client geschickt.

### News
Auf der Startseite von SplusEins werden News angezeigt. Diese Stammen aus verschiedenen Quellen. Der Bereich 'Neues vom Campus' enthält News von der Seite der Ostfalia und aus dem News-Feed von [Campus-38](https://www.campus38.de/newsfeed.xml). Des Weiteren gibt es den Bereich 'Neues aus X' wobei X eine konfigurierbare Quelle ist. Dazu zählen Fakultäten und Standorte der Ostfalia. Diese Informationen stammen ebenfalls von der offiziellen Ostfalia Webseite. News werden beim Backend angefragt. Dieses beantwortet die Anfrage entweder aus einem Cache oder fragt die Neuigkeiten von den jeweiligen News-Quellen ab. Bei einigen Quellen müssen die Informationen erst mit Hilfe eines Parsers aus HTML Seiten herausgefiltert werden.

### Busplan
SplusEins stellt Nahverkehrsinformationen für die Verbindung zwischen den beiden Standorten in Wolfenbüttel zur Verfügung. Die Daten stammen von der Deutschen Bahn und werden über ein System namens Hafas mithilfe des [Hafas-Client](https://github.com/public-transport/hafas-client) abgerufen. Wie auch beim Stundenplan und Mensaplan fragt das Frontend die Daten vom Backend ab, welches Anfragen an Hafas stellt. Die Anfragen können ebenfalls, sofern aktuelle Daten vorhanden sind, mithilfe eines Caches beantwortet werden.