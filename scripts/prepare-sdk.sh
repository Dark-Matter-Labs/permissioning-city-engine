#!/bin/bash

rm -rf ptc-sdk/permission-engine
mkdir -p ptc-sdk/permission-engine
mkdir -p ptc-sdk/permission-engine/src/lib/dto
mkdir -p ptc-sdk/permission-engine/src/lib/type
mkdir -p ptc-sdk/permission-engine/src/lib/util
mkdir -p ptc-sdk/permission-engine/src/api
mkdir -p ptc-sdk/permission-engine/src/database

cp -R permission-engine/src/lib/dto ptc-sdk/permission-engine/src/lib/
cp -R permission-engine/src/lib/type ptc-sdk/permission-engine/src/lib/
cp -R permission-engine/src/lib/util ptc-sdk/permission-engine/src/lib/

rsync -av --prune-empty-dirs --include "*/" --include "*/dto/**" --exclude "*" permission-engine/src/api/ ptc-sdk/permission-engine/src/api
find ptc-sdk/permission-engine/src/api -type f -path "*/dto/*" -exec sed -i '' 's|src/lib/|../../../lib/|g' {} \;

rsync -av --prune-empty-dirs --include "*/" --include "entity/**" --exclude "*" permission-engine/src/database/ ptc-sdk/permission-engine/src/database
find ptc-sdk/permission-engine/src/database -type f -path "*/entity/*" -exec sed -i '' 's|src/lib/|../../lib/|g' {} \;
