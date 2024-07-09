#!/bin/bash


echo "Creating digital ocean stuff"
echo "$DO_ACCESS_TOKEN"
echo "Creating digital ocean stuff"
echo "$DO_ACCESS_TOKEN"
for i in 1 2; do
    echo "Creating $SERVER-$i"
    docker-machine create --driver digitalocean \
    --digitalocean-access-token $DO_ACCESS_TOKEN \
    --digitalocean-region nyc1 \
    --digitalocean-size s-4vcpu-8gb  \
    --digitalocean-image ubuntu-18-04-x64 \
    --engine-install-url "https://releases.rancher.com/install-docker/19.03.9.sh" $SERVER-$i; 
done

docker-machine ssh $MACHINE_NAME-1 -- docker swarm init --advertise-addr $(docker-machine ip $MACHINE_NAME-1)

#docker swarm join --token SWMTKN-1-1c3s90miouav5fb78yfibhd8v82exdbgo4zvddz022nobngumm-2a8hcmu4xkh4rsxyjyzozsvmq 198.199.123.186:2377
#for i in 2 3; do
#   docker-machine ssh whs-$i -- docker swarm join --token SWMTKN-1-1c3s90miouav5fb78yfibhd8v82exdbgo4zvddz022nobngumm-2a8hcmu4xkh4rsxyjyzozsvmq 198.199.123.186:2377 
    #docker-machine ssh whs-$i -- docker plugin install rexray/dobs DOBS_TOKEN=aaabbbcccdddeeefff DOBS_REGION=nyc1 LINUX_VOLUME_FILEMODE=0775
#done

# Setup files on each node
./scripts/copy_configs_to_swarm.sh $MACHINE_NAME


#docker-machine ssh $MACHINE_NAME-1 -- docker swarm init --advertise-addr $(docker-machine ip $MACHINE_NAME-1)
eval $(docker-machine env $MACHINE_NAME-1)

docker network create -d overlay traefik-public
