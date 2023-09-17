# Deployment

## Dokku

Die Ordner `server/`, `web/` und `docs/` enthalten Projekte, die auf [Heroku](https://heroku.com) oder mit einer Heroku-kompatiblen Plattform wie [Dokku](https://dokku.viewdocs.io) gebaut werden können.

Nach der Einrichtung des Dokku-Servers (siehe unten) muss zum Deployen bei neuen Änderungen nur folgendes ausgeführt werden: `git push web` für das Frontend, `git push api` für das Backend und `git push docs` für diese Dokumentation.

### Einrichten der lokalen Maschine fürs Deployment

1. Das Spluseins-Repository clonen.
2. Einrichten der fürs Deployment notwendigen git Remotes im geklonten Repository. Dafür sind Zugriffsrechte über SSH Public Keys auf dem Server notwendig.
   ```bash
   git remote add web dokku@SERVER_IP_ADRESSE:web
   git remote add api dokku@SERVER_IP_ADRESSE:api
   git remote add docs dokku@SERVER_IP_ADRESSE:docs
   ```
   ::: tip
   Hierbei ist wichtig, dass der Teil hinter dem Doppelpunkt in der Datei `.dokku-monorpo` referenziert wird. Der Remote-Name (nach `remote add`) darf beliebig gewählt werden.
   :::
3. Deployen der Module mittels `git push NAME_DER_REMOTE`, also z.B. mit der vorherigen Einrichtung `git push web`, um das Frontend zu deployen. Dokku sorgt dann automatisch dafür, dass ein Node-Build-Environment auf dem Server angelegt wird, die Applikation gebaut wird und dann inklusive Hot-Swap deployt wird. Das spart sehr viel Arbeit im Vergleich zu manuellen Deployments.

### Aufsetzen des Dokku-Servers

1. Installation von Dokku [nach Anleitung](http://dokku.viewdocs.io/dokku/getting-started/installation/). Im anschließenden Web-Setup **VHOSTS aktivieren**.
2. Installation des [dokku-monorepo](https://github.com/notpushkin/dokku-monorepo/)-Plugin mit `dokku plugin:install https://gitlab.com/notpushkin/dokku-monorepo`.
3. Einmal **alle** Module mit der lokalen Maschine deployen, wie im vorherigen Kapitel erklärt. Dabei werden die Container automatisch erzeugt.
4. Netzwerk-Konfiguration für Dokku anlegen, damit die Container untereinander kommunizieren können.
   ```bash
   dokku network:create spluseins
   dokku network:set web attach-post-deploy spluseins
   dokku network:set api attach-post-deploy spluseins
   dokku network:set docs attach-post-deploy spluseins
   dokku network:rebuildall
   dokku config:set web HOST=0.0.0.0
   dokku config:set api HOST=0.0.0.0
   dokku config:set docs HOST=0.0.0.0
   dokku ps:restart web
   dokku ps:restart api
   dokku ps:restart docs
   ```
5. Setzen der Umgebungsvariablen für die Module, siehe [Umgebungsvariablen](./konfiguration.md#umgebungsvariablen). Besonders wichtig sind die `HOST`- und `API_URL`-Variablen, diese müssen wie folgt **auf dem Server** gesetzt werden:
   ```bash
   dokku domains:add web spluseins.de spluseins-i.ostfalia.de
   dokku config:set web API_URL=http://api.web:5000/ DOCS_URL=http://docs.web:5000/
   ```
   ::: tip
   Port 5000 ist der Standard für die Anwendung **innerhalb** des Dokku-Containers, welcher mit `APP_NAME.web` angesprochen werden kann. Die `web`-Anwendung bringt mit Nuxt einen Proxy mit, der dann Requests von `/api` und `/docs` auf die URLs in den Umgebungsvariablen weiterleitet.
   :::
6. SSL-Zertifikat angelegen:
   ```bash
   dokku domains:add frontend www.spluseins.de # wichig für redirect im nächsten schritt
   dokku letsencrypt:enable frontend
   dokku domains:remove frontend www.spluseins.de # domain wieder entfernen
   dokku letsencrypt:cron-job --add
   ```
7. Nginx: Weiterleitungen von www auf non-www anlegen, außerdem Catch-All hinzufügen. Dafür folgende Datei anlegen `/etc/nginx/conf.d/00-default-vhost.conf` mit Inhalt:

   ```nginx
   server {
       listen 80 default_server;
       listen [::]:80 default_server;

       server_name _;
       access_log off;
       return 410;
   }

   server {
       listen 443 ssl;
       listen [::]:443 ssl;

       server_name _;
       ssl_certificate /home/dokku/web/letsencrypt/certs/current/certificates/spluseins.de.crt;
       ssl_certificate_key /home/dokku/web/letsencrypt/certs/current/certificates/spluseins.de.key;
       return 410;
   }

   server {
       listen 80;
       listen [::]:80;

       server_name www.spluseins.de;
       return 301 https://spluseins.de$request_uri;
   }

   server {
       listen 443 ssl;
       listen [::]:443 ssl;

       server_name www.spluseins.de;
       ssl_certificate /home/dokku/web/letsencrypt/certs/current/certificates/spluseins.de.crt;
       ssl_certificate_key /home/dokku/web/letsencrypt/certs/current/certificates/spluseins.de.key;
       return 301 https://spluseins.de$request_uri;
   }
   ```

## Manuell

[Siehe README](https://github.com/SplusEins/SplusEins) zum Ausführen der Module im Development-Modus. Die Dokumentation der einzelnen Umgebungsvariablen befindet sich im [Konfiguration-Abschnitt](konfiguration.md#umgebungsvariablen) bzw. in der vorherigen Anleitung zu Dokku.

Alle Module (`docs`, `server`, `web`) können dazu **jeweils** mit den folgenden Befehlen in den produktiven Betrieb gebracht werden:

```bash
# Install all modules
npm install
# build and launch server
npm run build
npm start
```
