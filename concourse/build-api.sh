#!/bin/sh
cd frontend-build-result
npm run build:api
rm -r node_modules
cd ..
cp -R frontend-build-result/. build-result/
