#!/bin/bash
#. setprod.sh
#echo "Creating network"


if [[ "$1" == "" || "$2" == "" ]]; then

	echo "Please supply param1: name of server (e.g. crm)"
	echo "Please supply param2: machine number (e.g. 4)"
	
fi

echo "Creating digital ocean stuff"
echo "$DO_ACCESS_TOKEN"
echo $1-$2


docker-machine create --driver digitalocean --digitalocean-access-token $DO_ACCESS_TOKEN --digitalocean-region nyc1 --digitalocean-size s-4vcpu-8gb  --digitalocean-image ubuntu-20-04-x64 $1-$2; 


docker-machine ssh $1-1 docker swarm join-token worker

echo Please copy/paste the "docker swarm join..." command and press enter
read join_cmd

docker-machine ssh $1-$2 $join_cmd
cd ..
docker-machine ssh $1-$2 mkdir -p $(pwd)
docker-machine scp -r config $1-$2:$(pwd)


