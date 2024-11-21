#!/bin/bash

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

docker compose -f docker-compose.prod.yml up -d

echo "System started"

