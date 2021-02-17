---
title: Konfiguration
---

# Konfiguration

## Umgebungsvariablen
Sowohl Frontend als auch Backend können bzw. müssen über Umgebungsvariablen konfiguriert werden.

### Frontend
  * `HOST`: Host (Domain oder IP) des Servers (Default: `127.0.0.1`)
  * `API_URL`: URL der API ohne /api Suffix (Default: `https://spluseins.de/`)
  * `PAGE_CACHE_SECONDS`: Cache-Dauer in Sekunden für gerenderte Nuxt-Seiten (Default: `600`)
  * `PROTECTED_INFORMATION`: Namen der Team-Mitglieder für das Impressum und die Datenschutz-Seite

### Backend
  * `HOST`: Host (Domain oder IP) des Servers (Default: `127.0.0.1`)
  * `PORT`: Port des Servers (Default: `3001`)
  * `SKED_USER`: stundenplan.ostfalia.de Benutzername
  * `SKED_PASSWORD`: stundenplan.ostfalia.de Passwort
  * `SKED_URL`: Ostfalia Stundenplan/Sked URL (Default: `https://stundenplan.ostfalia.de`)
  * `COOKIE_SECRET`: Token, welcher genutzt wird um Cookies zu signieren
  * `CACHE_PATH`: Pfad welcher angibt wo gecachte Daten gespeichert werden sollen (Default: `/tmp/spluseins-cache`)
  * `CACHE_DISABLE`: Boolean-Wert welche den Cache aktivieren/deaktivieren kann (Default `true`)
  * `API_PREFIX`: Optionales Präfix des Servers z.B. `/api`
  * `ICS_PRELOAD_WEEKS`: Anzahl der Wochen, welche bei ICS-Kalenderabfragen zurückgeliefert werden (Default: `4`)
  * `ICS_CACHE_SECONDS`: Cache-Dauer in Sekunden für ICS-Abfragen (Default: `600`)
  * `NEWS_CACHE_SECONDS`: Cache-Dauer in Sekunden für News-Abfragen (Default: `1800`)
  * `MENSA_CACHE_SECONDS`: Cache-Dauer in Sekunden für Mensa-Abfragen (Default: `1800`)
  * `SPLUS_CACHE_SECONDS`: Cache-Dauer in Sekunden für Stundenplan-Abfragen (Default: `10800`)
