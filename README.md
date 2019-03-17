# SplusEins

## Issue Management

Planned features and bugs are tracked in [Trello](https://trello.com/b/8L18rOVd).
Please send us a mail if you have any questions or suggestions.

## Build Setup (Frontend)

``` bash
# install dependencies
$ npm install

# Set environment variables to use the remote api
$ API_URL=https://spluseins.de/ (Linux/Unix)
$ set API_URL=https://spluseins.de/ (Windows)

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm start

# generate static project
$ npm run generate
```

## Build Setup (Backend)

```bash

# Set environment variables
$ CACHE_PATH=spluseins-cache (Linux/Unix)
$ set CACHE_PATH=spluseins-cache (Windows)

# start dev api at localhost:3001
$ npm run dev:api

# build for production and launch server
$ npm run build:api
$ npm start:api
```

## Configuration

Environment variables:

  * `CACHE_PATH` (backend)
  * `CACHE_DISABLE` (backend)
  * `HOST` (backend)
  * `PORT` (backend)
  * `API_PREFIX` (backend)
  * `SEMESTER_WEEK_1` (frontend): first week with lectures
  * `ICS_PRELOAD_WEEKS` (backend): number of weeks to fetch for ICS
  * `ICS_CACHE_SECONDS` (backend): timetable and ICS cache duration