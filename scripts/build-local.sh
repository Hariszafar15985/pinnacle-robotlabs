#! /usr/bin/env sh

# Exit in case of error
SERVICE=$1
set -e

cp -rf config backend/
docker-compose build
