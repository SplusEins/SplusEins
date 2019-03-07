# SplusEins

## Issue Management

Planned features and bugs are tracked in [Trello](https://trello.com/b/8L18rOVd).
Please send us a mail if you have any questions or suggestions.

## Build Setup (Frontend)

``` bash
# install dependencies
$ npm install

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

# start dev api at localhost:3001
$ npm run dev:api

# build for production and launch server
$ npm run build:api
$ npm start:api

# Set environment variables on Linux
$ API_URL=https://spluseins.de/
$ CACHE_PATH=spluseinscache

# Set environment variables on Windows (you have to use default cmd-line tool)
$ set API_URL=https://spluseins.de/
$ set CACHE_PATH=spluseinscache
```

## Concourse Setup (CI/CD)

First download the [fly cli](https://concourse-ci.org/download.html).

```bash
# fly login (if you haven't created a target yet)
$ fly -t <new targetname> login --concourse-url https://ci.spluseins.de

# fly login (with target)
$ fly -t <targetname> login

# fly set pipeline
$ fly -t <targetname> set-pipeline -p spluseins -c pipeline.yml -l credentials.yml

# fly destroy pipeline
$ fly -t <targetname> destroy-pipeline -p spluseins
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
