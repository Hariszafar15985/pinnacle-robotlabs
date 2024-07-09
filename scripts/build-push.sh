#! /usr/bin/env sh

# Exit in case of error

SERVICE=$1
set -e

if [[ "$ENV" == "dev" ]]
then
  echo "You are on wrong env"
  exit 1
fi

echo "version: '3.8'" > docker-stack.yml
docker-compose \
-f docker-compose.shared.admin.yml \
-f docker-compose.deploy.command.yml \
-f docker-compose.deploy.build.yml \
-f docker-compose.deploy.images.yml \
-f docker-compose.deploy.labels.yml \
-f docker-compose.deploy.networks.yml \
-f docker-compose.deploy.volumes-placement.yml \
-f docker-compose.deploy.env.yml \
config > docker-stack.yml

# Fix port value
sed -i 's/"9090"/9090/' docker-stack.yml
sed -i 's/"8080"/8080/' docker-stack.yml
sed -i 's/"443"/443/' docker-stack.yml
sed -i 's/"80"/80/' docker-stack.yml
sed -i '/name: robotlab/d' docker-stack.yml


CMD="docker-compose -f docker-stack.yml build $SERVICE; docker-compose -f docker-stack.yml push "$SERVICE""

if [ -z "$SERVICE" ]
then
  CMD="docker-compose -f docker-stack.yml build backend frontend; docker-compose -f docker-stack.yml push backend frontend"
fi

docker-compose -f docker-compose.deploy.build.yml -f docker-compose.deploy.images.yml config > docker-stack.yml
eval $CMD