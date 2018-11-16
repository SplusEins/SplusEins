#!/bin/sh
cd npm-install-result
npm run build
cd ..
cp -R npm-install-result/. frontend-build-result/
