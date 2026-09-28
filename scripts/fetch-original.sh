#!/bin/sh
# Downloads one licensed original, verifies it fully decodes, and stores it (max 2400px wide)
# in assets-src/photos. Usage: scripts/fetch-original.sh <name> <download-url>
set -e
cd "$(dirname "$0")/.."
tmp="assets-src/clean/$1.jpg"
mkdir -p assets-src/clean
curl -sL --max-time 170 -o "$tmp" "$2"
node -e "
const sharp=require('sharp');
sharp('$tmp',{failOn:'truncated'}).rotate().resize({width:2400,withoutEnlargement:true}).jpeg({quality:90,mozjpeg:true})
 .toFile('assets-src/photos/$1.jpg').then(i=>console.log('ok $1',i.width+'x'+i.height)).catch(e=>{console.log('BAD $1',e.message);process.exit(1)})"
rm -f "$tmp"
