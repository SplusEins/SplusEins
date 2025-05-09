# Konfiguration

## Umgebungsvariablen

Sowohl Frontend als auch Backend können bzw. müssen über Umgebungsvariablen konfiguriert werden.

### Frontend

- `HOST`: Host (Domain oder IP) des Servers (Default: `127.0.0.1`)
- `API_URL`: (Lokale) URL der API ohne `/api` Suffix (z.B. `http://localhost:50001/`), alle Requests zu `/api` werden (von Nuxt als Proxy) zu dieser URL weitergeleitet.
- `DOCS_URL`: (Lokale) URL der Dokumentation (z.B. `http://localhost:50002/`), alle Requests zu `/docs` werden (von Nuxt als Proxy) zu dieser URL weitergeleitet.
- `PAGE_CACHE_SECONDS`: Cache-Dauer in Sekunden für gerenderte Nuxt-Seiten (Default: `600`)
- `PROTECTED_INFORMATION`: Namen der Team-Mitglieder für das Impressum und die Datenschutz-Seite

### Backend

- `HOST`: Host (Domain oder IP) des Servers (Default: `127.0.0.1`)
- `PORT`: Port des Servers (Default: `3001`)
- `SKED_USER`: stundenplan.ostfalia.de Benutzername
- `SKED_PASSWORD`: stundenplan.ostfalia.de Passwort
- `COOKIE_SECRET`: Token, welcher genutzt wird um Cookies zu signieren
- `CACHE_PATH`: Pfad welcher angibt wo gecachte Daten gespeichert werden sollen (Default: `/tmp/spluseins-cache`)
- `CACHE_DISABLE`: Boolean-Wert welche den Cache aktivieren/deaktivieren kann (Default `true`)
- `API_PREFIX`: Optionales Präfix des Servers z.B. `/api`
- `ICS_PRELOAD_WEEKS`: Anzahl der Wochen, welche bei ICS-Kalenderabfragen zurückgeliefert werden (Default: `4`)
- `ICS_CACHE_SECONDS`: Cache-Dauer in Sekunden für ICS-Abfragen (Default: `600`)
- `NEWS_CACHE_SECONDS`: Cache-Dauer in Sekunden für News-Abfragen (Default: `1800`)
- `MENSA_CACHE_SECONDS`: Cache-Dauer in Sekunden für Mensa-Abfragen (Default: `1800`)
- `SPLUS_CACHE_SECONDS`: Cache-Dauer in Sekunden für Stundenplan-Abfragen (Default: `10800`)
