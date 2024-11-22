#!/bin/bash

echo "Running: docker system prune -f -a"
docker system prune -f -a

echo "Running: docker container prune -f"
docker container prune -f

echo "Running: docker image prune -f -a"
docker image prune -f -a

echo "Running: docker volume prune -f -a"
docker volume prune -f -a

echo "Running: docker builder prune -f"
docker builder prune -f

echo "Docker prune completed."
