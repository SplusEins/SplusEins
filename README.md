# SplusEins

## Issue Management

Planned features and bugs are tracked in [Trello](https://trello.com/b/8L18rOVd).
Please send us a mail if you have any questions or suggestions.

## Build Setup (Frontend)

`cd web/`

``` bash
# install dependencies
$ npm install

# Set environment variables to use the remote api
$ API_URL=https://spluseins.de/ #Linux/Unix
$ set API_URL=https://spluseins.de/ #Windows
# Alternatively use locally provided API (see below, backend setup)
$ API_URL="http://127.0.0.1:3001"

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm start

# generate static project
$ npm run generate
```

## Build Setup (Backend)

`cd server/`

```bash
# install dependencies
$ npm install

# Set environment variables
$ CACHE_PATH=spluseins-cache (Linux/Unix)
$ set CACHE_PATH=spluseins-cache (Windows)

# start dev api at localhost:3001
$ npm run dev

# build for production and launch server
$ npm run build
$ npm start
```

## Configuration

Please refer to [the SplusEins documentation](https://docs.spluseins.de/konfiguration.html)
