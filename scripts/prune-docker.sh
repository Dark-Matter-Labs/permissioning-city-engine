#!/bin/bash

echo "Running: docker system prune -f -a"
docker system prune -f -a

echo "Running: docker container prune"
docker container prune

echo "Running: docker image prune -a"
docker image prune -a

echo "Running: docker volume prune -a"
docker volume prune -a

echo "Running: docker builder prune"
docker builder prune

echo "Docker prune completed."
