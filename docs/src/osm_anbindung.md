# Kalender Open Street Maps Anbindung

## Was ist OSM?

Open Street Map ist eine open source Alternative für Karten, die ähnlich wie Wikipedia funktioniert: Jeder mit einem Account kann die Karte verändern ([OpenStreetMap about](https://www.openstreetmap.org/about)).

## Erstellen der Links zu Open Street Map

Die Seite https://www.openstreetmap.org/ hat keine Unterstützung für Räume. Dafür müssen andere Viewer wie [IndoorEqual](https://indoorequal.org) oder [OSMApp](https://osmapp.org) genutzt werden. Wir nutzen [OSMApp](https://osmapp.org).

### Erstellen der Links zu OSMApp

Jeder Raum hat ein "ref", in den typischerweise die Raumerkennung eingetragen wird. Darüber kann man den Raum finden. Dazu besitzt jeder Raum eine einzigartige Id. Mit der Id kann der Link zu OSMApp erstellt werden.

Beispielraum Exer / Salzdahlumer Straße:

```
indoor 	room
level 	2
name 	252 Hörsaal
ref 	WF-EX-2/252
room 	lecture
id      1435503585

---

indoor 	room
level 	0
name 	Hörsal A026
ref 	A026
room 	lecture
id      1446092724
```

### Refs erhalten

Die Refs und Ids erhalten wir mit einem API Request an [OverpassTurbo Query](https://overpass-turbo.eu/s/2g5Y) – eine Seite, die ermöglicht Queries über die OSM Daten laufen zu lassen.

Da manche Räume an unterschiedlichen Standorten gleich heißen wird für jeden Standort eine Query genutzt und die daten in einer eigenen Datei für jeden Standort gespeichert.

### Links erstellen

Setzt man die Id in "https://osmapp.org/way/:id" ein, kommt man direkt zu dem Raum (z. B. WF-EX-2/252: https://osmapp.org/way/1435503585).

## Eigene Räume erstellen

Welche Tools man nutzen kann und wie der aktuelle Status des Mappings ist, wird auf [diesem Pad](https://pad.gwdg.de/LUdInNDiRjOgSfNIaERUhg#) dokumentiert.

Es ist beim Mapping wichtig, dass die "ref" des Raums mit dem Namen übereinstimmen, der von der Ostfalia für die Stundenpläne gegeben wird.

## Github Actions Workflow

Jeden Tag werden von einer GitHub Action über die Overpass API die Raumdaten angefragt und falls sie sich verändert haben, wird ein Pull-Request erstellt. Die Raumdaten sind im JSON-Format unter `/server/assets/overpass_osm` gespeichert. Der Workflow ruft den script `/server/scripts/getRoomIds.sh` auf.

Der Workflow sorgt also dafür, dass jeden Tag um 05:00 die OSM-Daten aktualisiert werden, also kann es bis zu 24 Stunden dauern, bis gelöschte Räume nicht mehr im Kalender verlinkt werden oder neu gemappte Räume im Kalender erscheinen.
