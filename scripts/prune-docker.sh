#!/bin/bash

echo "Running: system prune -f -a"
docker system prune -f -a

echo "Running: docker container prune"
docker docker container prune

echo "Running: docker image prune -a"
docker docker image prune -a

echo "Running: docker volume prune -a"
docker docker volume prune -a

echo "Running: docker builder prune"
docker docker builder prune

echo "Docker prune completed."
