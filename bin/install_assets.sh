#!/bin/sh
set -e

cp -rp assets/* dist/

if [ -n $1 ]; then
    npx json -f dist/manifest.json -I -e "this.version_name = \"$1\""
fi

if [ -n $2 ]; then
    npx json -f dist/manifest.json -I -e "this.version = \"$2\""
fi
