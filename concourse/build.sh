#!/bin/sh
cd repository
npm install
npm run build
cd ..
cp -R repository/. build-result/
cd build-result
rm -r node_modules
