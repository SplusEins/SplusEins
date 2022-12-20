# SplusEins

![GitHub API Workflow Status](https://img.shields.io/github/actions/workflow/status/SplusEins/SplusEins/build-server.yml?branch=master&label=api%20build)
![GitHub Web Workflow Status](https://img.shields.io/github/actions/workflow/status/SplusEins/SplusEins/build-web.yml?branch=master&label=web%20build)
![GitHub Deploy Workflow Status](https://img.shields.io/github/actions/workflow/status/SplusEins/SplusEins/deploy.yml?branch=master&label=deploy)
![Uptime Robot ratio (30 days)](https://img.shields.io/uptimerobot/ratio/m787659430-7cab3eb7b484e1a13fd30a69?label=uptime)

[SplusEins documentation](https://spluseins.de/docs/)

## Issues

Please report any bugs or feature requests to the [GitHub issue tracker](https://github.com/SplusEins/SplusEins/issues) or write us a mail.

## Contributing

Contributions very much welcome! Feel free to write us a mail if you have any questions or just open a new issue. Don't forget to check out the [project documentation](https://spluseins.de/docs).

## Installation

Follow the next steps if you want to develop/build locally.

### Setup frontend

`cd web/`

```bash
# install dependencies
npm install

# Set environment variables to use the remote api
API_URL=https://spluseins.de/ #Linux/Unix
set API_URL=https://spluseins.de/ #Windows
# If you want to use your own backend (see below in backend setup), set this instead:
API_URL="http://127.0.0.1:3001"

# serve with hot reload at localhost:3000
npm run dev

# Optional: generate static project inside dist/
npm run generate
```

### Setup backend

`cd server/`

Add your ostfalia credentials as environment variables, preferably in a `.env`-file.

```bash
# ./server/.env
SKED_USER=idxxxxxx
SKED_PASSWORD=your_ostfalia_pw
```

```bash
# install dependencies
npm install

# Set environment variables
CACHE_PATH=spluseins-cache # Linux/Unix
set CACHE_PATH=spluseins-cache # Windows

# start dev api at localhost:3001/api
npm run dev
```

### Setup documentation

`cd docs/`

```bash
# install dependencies
npm install

# serve docs at http://localhost:8080/docs/
npm run dev
```
