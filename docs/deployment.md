# Deployment

## Netlify

Die Datei `netlify.toml` konfiguriert den Build für [Netlify](https://www.netlify.com).
Das Frontend wird statisch gebaut und vom Netlify CDN ausgeliefert.
Das Backend wird als AWS-kompatible Lambda-Funktion für Netlify Functions gebaut.

Nach dem Verbinden des Netlify-Accounts mit dem GitHub-Repository läuft das Deployment automatisch.

## dokku

`server/` und `web/` sind Projekte, die auf [Heroku](https://heroku.com) oder mit einer Heroku-kompatiblen Plattform gebaut werden, zum Beispiel [Dokku](https://dokku.viewdocs.io).
Für Dokku muss zusätzlich das [dokku-monorepo](https://github.com/notpushkin/dokku-monorepo/) installiert werden.

Nach der Einrichtung des Dokku-Servers kann mit `git push spluseins.de` das Frontend und `git push api.spluseins.de` das Backend deployt werden.

## manuell

[Siehe README](https://github.com/SplusEins/SplusEins), die HTML- und JavaScript-Dateien liegen anschließend in `dist/`.
