#!/bin/sh
cd repository
npm install
npm run build
cd ..
cp -R repository/. build-result/
