#!/bin/bash

DOCKER_COMPOSE="docker-compose"

if [ "$1" == "prod" ]; then
  DOCKER_COMPOSE="docker-compose.prod"
fi

echo "Backup start..."

./scripts/backup.sh

echo "Backup complete"

echo "Shutting down..."

docker compose down

echo "Shutting down complete"

echo "Deleting redis data..."

rm -rf ./data/redis/*

echo "Deleted redis data"

echo "Restarting system..."

docker compose -f $DOCKER_COMPOSE.yml up -d

echo "System started"

