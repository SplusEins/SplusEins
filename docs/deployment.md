# Deployment


## Dokku

Die Ordner `server/`, `web/` und `docs/` enthalten Projekte, die auf [Heroku](https://heroku.com) oder mit einer Heroku-kompatiblen Plattform wie [Dokku](https://dokku.viewdocs.io) gebaut werden können.

Nach der Einrichtung des Dokku-Servers (siehe unten) muss zum Deployen bei neuen Änderungen nur folgendes ausgeführt werden: `git push web` für das Frontend, `git push api` für das Backend und `git push docs` für diese Dokumentation.

Die drei Projekte landen mit Dokku dann in einzelnen Containern und können auf bestimmten `localhost`-Ports angesprochen werden. Damit diese von extern auf den richtigen Pfaden (das Backend auf `https://domain.de/api/`, das Frontend regulär auf `https://domain.de`) angesprochen werden können, wird mittels `nginx` ein Reverse-Proxy vorgeschaltet, der die Pfade an die richtigen lokalen Ports (bzw. die dahinterstehenden Dokku-Container) weiterleitet.

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
1. Installation von Dokku [nach Anleitung](http://dokku.viewdocs.io/dokku/getting-started/installation/). Im anschließenden Web-Setup den **Haken bei VHOSTS entfernen**, da nicht mit den Subdomains gearbeitet wird. Den Servernamen auf `localhost` setzen.
2. Installation des [dokku-monorepo](https://github.com/notpushkin/dokku-monorepo/)-Plugin mit `dokku plugin:install https://gitlab.com/notpushkin/dokku-monorepo`.
3. Anlegen der Dokku-Container für die einzelnen Module:
```
dokku apps:create web
dokku apps:create api
dokku apps:create docs
```
4. Ports der einzelnen Module/Container wie folgt definieren (werden sonst zufällig gesetzt). 
```
dokku proxy:ports-set web http:50000:5000
dokku proxy:ports-set api http:50001:5000
dokku proxy:ports-set docs http:50002:5000
```
::: tip
Port 5000 ist der Standard für die Anwendung **innerhalb** des Dokku-Containers, der dann auf einen Port des Hosts weitergeleitet werden muss. Diese entsprechenden Host-Ports (z.B. hier 50002 für `docs`) sind frei wählbar und müssen nur wieder innerhalb des nginx Reverse Proxy weiter unten referenziert werden.
:::

5. Setzen der Umgebungsvariablen für die Module, siehe [Umgebungsvariablen](./konfiguration.md#umgebungsvariablen). Besonders wichtig sind die `HOST`-Variablen, diese müssen wie folgt **auf dem Server** gesetzt werden:
```
dokku config:set web HOST=0.0.0.0
dokku config:set api HOST=0.0.0.0
dokku config:set docs HOST=0.0.0.0
```
::: warning
Ohne das Setzen der Host-Variablen funktioniert der Setup nicht, da die Applikationen standardmäßig nur auf `localhost` innerhalb des Containers gebindet werden.
:::
6. Anlegend der nginx-Konfiguration für den notwendigen Reverse Proxy als `/etc/nginx/conf.d/00-default-vhost.conf`:
```nginx
server {
  server_name _;
  listen 80 default_server;
  listen [::]:80 default_server ipv6only=on;
  access_log  /var/log/nginx/dokku-access.log;
  error_log   /var/log/nginx/dokku-error.log;

  location / {
    proxy_pass http://localhost:50000;
    include /etc/nginx/proxy-params.conf;
  }
  location /api {
    proxy_pass http://localhost:50001;
    include /etc/nginx/proxy-params.conf;
  }
  location /docs {
    proxy_pass http://localhost:50002;
    include /etc/nginx/proxy-params.conf;
  }
}
map $http_upgrade $connection_upgrade {
    # Used inside the included proxy params configuration (for websockets)
    default upgrade;
    ''      close;
}
```
7. Die Datei `/etc/nginx/proxy-params.conf` wird von der angelegten Reverse-Proxy-Konfiguration referenziert und muss deshalb mit folgendem Inhalt angelegt werden. Diese setzt einige allgemeine Einstellungen für jeden Reverse Proxy.
```nginx
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection $connection_upgrade;
proxy_http_version 1.1;
proxy_set_header X-REAL-IP $remote_addr;
proxy_buffering off;
```
8. Die Konfiguration kann mit `nginx -t` getestet werden und wird mit `sudo systemctl restart nginx` aktiv.
9. Wie im vorherigen Kapitel beschrieben, muss jetzt mit einer lokalen Maschine deployt werden. Danach sollte SplusEins erreichbar sein.
::: tip
Mittels des Let's Encrypt Bots kann zudem sehr einfach ein SSL-Zertifikat erstellt werden: `sudo certbot --nginx -d domainname.de -d www.domainname.de` ([ausführliche Anleitung](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-20-04-de)).
:::


## Manuell

[Siehe README](https://github.com/SplusEins/SplusEins), die HTML- und JavaScript-Dateien liegen anschließend in `dist/`.
