#!/bin/sh
cd npm-install-result
API_URL=https://master.spluseins.de/ npm run build
cd ..
cp -R npm-install-result/. frontend-build-result/
