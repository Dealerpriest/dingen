#!/bin/bash

echo "Building SPA."
echo ""

echo "removing previous build"
rm -r ./backend/caddy/dist/spa


echo "reading .env file and copies relevant variables"
# grep -vE "(ADMIN_USER|ADMIN_PASSWORD)" .env > ../../app/.env
# grep -B 9999999 "BACKEND_ONLY_VARIABLES" .env > ./app/.env.production.local

awk 'NR==1, /BACKEND_ONLY/ {print}' .env | awk 'length>1 && $1 !~ "#" {print "VUE_APP_"$0} length <=1 || $1 ~ "#" {print}' > ./app/.env.production.local

echo "running npm install"
npm --prefix ./app install
echo "running npm build"
# cd ./app
# npm run build
npm --prefix ./app run build


# echo "copy new build into folder ../caddy/dist/"
cp -r ./app/dist/ ./backend/caddy/dist/spa/