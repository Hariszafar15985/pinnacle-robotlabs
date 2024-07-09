#! /usr/bin/env bash

set -e

if [[ $ENV == "dev" ]]
then
  echo "You are on wrong env"
  exit 1
fi

read -p "Ready to deploy to: $MACHINE_NAME-1? Press Y to continue: " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Y]$ ]]
then
  exit 1
fi

echo "version: '3.8'" > docker-stack.yml
docker-compose \
-f docker-compose.shared.admin.yml \
-f docker-compose.deploy.command.yml \
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

eval $(docker-machine env "$MACHINE_NAME"-1)

docker stack deploy -c docker-stack.yml --resolve-image always --with-registry-auth "${STACK_NAME}" --prune

sleep 1
docker stack ps -f "desired-state=running" "${STACK_NAME}"

