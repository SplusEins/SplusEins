# Konfiguration

## Umgebungsvariablen

Sowohl Frontend als auch Backend können bzw. müssen über Umgebungsvariablen konfiguriert werden.

### Frontend

Das Frontend ist eine Single-Page-App (Vue 3, gebaut mit Vite). `npm run build` erzeugt statische Dateien in `web/dist/`, `npm start` startet einen kleinen Express-Server (`web/server.js`), der diese Dateien ausliefert und `/api` sowie `/docs` weiterleitet.

Zur Laufzeit (`npm start` bzw. `npm run dev`):

- `PORT`: Port des Servers (Default: `3000`)
- `API_URL`: (Lokale) URL der API ohne `/api` Suffix (z.B. `http://localhost:50001/`), alle Requests zu `/api` werden zu dieser URL weitergeleitet.
- `DOCS_URL`: (Lokale) URL der Dokumentation (z.B. `http://localhost:50002/`), alle Requests zu `/docs` werden zu dieser URL weitergeleitet.

Beim Bauen (`npm run build`), da diese Werte fest in die App eingebaut werden:

- `PROTECTED_INFORMATION`: Namen der Team-Mitglieder für das Impressum und die Datenschutz-Seite
- `STAGING`: `true` für den Staging-Server, zeigt einen Hinweis in der Kopfzeile
- `GIT_REV`: Git-Commit des Builds, wird auf dem Staging-Server verlinkt

### Backend

- `HOST`: Host (Domain oder IP) des Servers (Default: `127.0.0.1`)
- `PORT`: Port des Servers (Default: `3001`)
- `SKED_USER`: stundenplan.ostfalia.de Benutzername
- `SKED_PASSWORD`: stundenplan.ostfalia.de Passwort
- `CACHE_PATH`: Pfad welcher angibt wo gecachte Daten gespeichert werden sollen (Default: `/tmp/spluseins-cache`)
- `CACHE_DISABLE`: Wenn gesetzt (z.B. `true`), wird nichts zwischengespeichert (Default: Cache aktiv)
- `API_PREFIX`: Optionales Präfix des Servers z.B. `/api`
- `ICS_PRELOAD_WEEKS`: Anzahl der Wochen, welche bei ICS-Kalenderabfragen zurückgeliefert werden (Default: `4`)
- `ICS_CACHE_SECONDS`: Cache-Dauer in Sekunden für ICS-Abfragen (Default: `600`)
- `NEWS_CACHE_SECONDS`: Cache-Dauer in Sekunden für News-Abfragen (Default: `1800`)
- `MENSA_CACHE_SECONDS`: Cache-Dauer in Sekunden für Mensa-Abfragen (Default: `1800`)
- `SPLUS_CACHE_SECONDS`: Cache-Dauer in Sekunden für Stundenplan-Abfragen (Default: `10800`)
- `BUS_CACHE_SECONDS`: Cache-Dauer in Sekunden für Bus-Abfragen (Default: `60`)
- `CENSOR_DISABLE`: Wenn gesetzt, werden die Namen der Dozenten nicht abgekürzt

Alle Variablen werden in `server/config.ts` gelesen. Ist eine Zahl ungültig, startet der Server nicht.
