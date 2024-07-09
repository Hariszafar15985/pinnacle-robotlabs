#! /usr/bin/env bash

set -e

if [[ $ENV == "dev" ]]
then
  echo "You are on wrong env"
  exit 1
fi

docker-compose \
-f docker-compose.stage.command.yml \
-f docker-compose.stage.env.yml \
-f docker-compose.stage.images.yml \
-f docker-compose.stage.labels.yml \
config > docker-compose.stage.yml
