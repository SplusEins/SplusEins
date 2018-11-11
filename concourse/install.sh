#!/bin/sh
cd repository
npm install
cd ..
cp -R repository/. npm-install-result/
