#!/bin/sh
cd inserted-information-result
npm run build
cd ..
cp -R inserted-information-result/. frontend-build-result/
