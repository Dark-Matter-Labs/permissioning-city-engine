#!/bin/bash
set -e


if [ "$ENGINE_MODE" = "api" ]; then
  echo "Install packages..."
  npm i
  echo "Package installation complete!"

  echo "Building application..."
  npm run build
  echo "Application build complete!"
fi

if [ "$NODE_ENV" = "production" ]; then
  echo "Production environment detected, serving the app..."
  npm run start:prod
else
  echo "Non-production environment detected, tailing /dev/null..."
  npm i -g pm2@5.4.3
  pm2 start --name "permission-engine" npm -- run start:dev
  pm2 logs
  tail -f /dev/null
fi
