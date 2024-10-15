#!/bin/bash
git pull origin prod
git submodule update

docker compose down
docker compose -f docker-compose.prod.yml up -d --build
docker system prune -f

echo "Deployment completed."
