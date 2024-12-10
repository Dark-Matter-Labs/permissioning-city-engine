#!/bin/bash

git stash

cd ptc-dashboard
git stash
cd ..

git pull origin prod
git submodule update

docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
docker system prune -f -a

echo "Deployment completed."
