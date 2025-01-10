#!/bin/bash

DOCKER_COMPOSE="docker-compose"

if [ "$1" == "prod" ]; then
  DOCKER_COMPOSE="docker-compose.prod"
fi

if [ "$1" == "prod" ]; then
  git stash

  cd ptc-dashboard
  git stash
  cd ..

  git pull origin prod
  git submodule update
fi

docker compose -f $DOCKER_COMPOSE.yml build --no-cache
docker compose -f $DOCKER_COMPOSE.yml down
docker compose -f $DOCKER_COMPOSE.yml up -d

if [ "$1" == "prod" ]; then
  docker system prune -f -a
fi

echo "Deployment completed."
