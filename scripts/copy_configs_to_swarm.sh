#!/bin/bash
echo "Copying files to swarm"
SERVER=$1

# Dirs outside pwd
docker-machine ssh $SERVER-1 sudo mkdir -p /data/mysql
docker-machine ssh $SERVER-1 sudo chown -R ubuntu:ubuntu /data

docker-machine ssh $SERVER-1 sudo mkdir -p $(pwd)
docker-machine ssh $SERVER-$i sudo chown -R ubuntu:ubuntu $(pwd)
docker-machine scp -r mysql_init $SERVER-1:$(pwd)

for i in 1 2; do
	docker-machine ssh $SERVER-$i sudo mkdir -p $(pwd)
	docker-machine ssh $SERVER-$i sudo mkdir $(pwd)/data
	docker-machine ssh $SERVER-$i sudo chown -R ubuntu:ubuntu $(pwd)
	docker-machine scp -r config $SERVER-$i:$(pwd)
	docker-machine ssh $SERVER-$i touch $(pwd)/config/docker/traefik2/acme/acme.json
	docker-machine ssh $SERVER-$i sudo chmod 600 $(pwd)/config/docker/traefik2/acme/acme.json
done

echo "create network"
docker network create -d overlay traefik-public
