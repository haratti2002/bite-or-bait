#!/bin/sh
# Builds the CrazyGames upload package: dist/bite-or-bait-crazygames.zip
# (index.html sits at the root of the zip, as CrazyGames requires)
set -e
cd "$(dirname "$0")"
mkdir -p dist
rm -f dist/bite-or-bait-crazygames.zip
zip -9 -X dist/bite-or-bait-crazygames.zip \
  index.html style.css audio.js entities.js renderer.js game.js ksk-baits-logo.png
echo "Built: $(pwd)/dist/bite-or-bait-crazygames.zip"
