# SplusEins
![Server Build](https://github.com/SplusEins/SplusEins/workflows/Server%20Build/badge.svg?branch=master)
![Web Build](https://github.com/SplusEins/SplusEins/workflows/Web%20Build/badge.svg?branch=master)
![Deployment](https://github.com/SplusEins/SplusEins/workflows/Deploy/badge.svg?branch=master)

[SplusEins documentation](https://spluseins.de/docs/)

## Issues

Please report any bugs or feature requests to the [GitHub issue tracker](https://github.com/SplusEins/SplusEins/issues) or write us a mail.

## Contributing

Contributions very much welcome! Feel free to write us a mail if you have any questions or just open a new issue. Don't forget to check out the [project documentation](https://spluseins.de/docs).

## Installation
Follow the next steps if you want to develop/build locally.

### Setup frontend

`cd web/`

``` bash
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