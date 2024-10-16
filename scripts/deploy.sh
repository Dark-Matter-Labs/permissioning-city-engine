#!/bin/bash
git pull origin prod
git submodule update

docker compose build
docker compose down
docker compose -f docker-compose.prod.yml up -d
docker system prune -f

echo "Deployment completed."
