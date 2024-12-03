#!/bin/bash
set -e

npm i

npm i -g pm2@5.4.3

npm run build

if [ "$NODE_ENV" = "production" ]; then
  echo "Production environment detected, serving the app..."
  npm run start:prod
else
  echo "Non-production environment detected, tailing /dev/null..."
  pm2 start --name "permission-engine" npm -- run start:dev
  pm2 logs
  tail -f /dev/null
fi
