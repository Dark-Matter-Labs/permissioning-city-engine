#!/bin/bash

git stash

cd ptc-dashboard
git stash
cd ..

git pull origin prod
git submodule update

docker compose build --no-cache
docker compose down
docker compose -f docker-compose.prod.yml up -d
docker system prune -f -a

echo "Deployment completed."
