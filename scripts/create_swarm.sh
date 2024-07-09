#!/bin/bash

if [ "$DO_ACCESS_TOKEN" == "" ]; then
    echo "Aws"
    echo "Creating swarm-master"
    docker-machine create --driver amazonec2 \
                            --amazonec2-open-port 80 \
                            --amazonec2-open-port 443 \
                            --amazonec2-open-port 2377 \
                            --amazonec2-open-port 2376 \
                            --amazonec2-open-port 7946 \
                            --amazonec2-open-port 4789 \
                            --amazonec2-instance-type "t2.medium" \
                            --amazonec2-vpc-id $AWS_VPC \
                            --amazonec2-access-key $AWS_ACCESS_KEY_ID \
                            --amazonec2-secret-key $AWS_SECRET_ACCESS_KEY\
                            --amazonec2-root-size 160 \
                            --swarm-master \
                            --amazonec2-region us-east-1 $MACHINE_NAME-1

    echo "Creating swarm worker 1"
    docker-machine create --driver amazonec2 \
                            --amazonec2-open-port 80 \
                            --amazonec2-open-port 443 \
                            --amazonec2-open-port 2377 \
                            --amazonec2-open-port 2376 \
                            --amazonec2-open-port 7946 \
                            --amazonec2-open-port 4789 \
                            --amazonec2-instance-type "t2.medium" \
                            --amazonec2-vpc-id $AWS_VPC \
                            --amazonec2-access-key $AWS_ACCESS_KEY_ID \
                            --amazonec2-secret-key $AWS_SECRET_ACCESS_KEY\
                            --amazonec2-root-size 160 \
                            --swarm \
                            --amazonec2-region us-east-1 $MACHINE_NAME-2

    ./scripts/copy_configs_to_swarm.sh $MACHINE_NAME

else
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

fi

eval $(docker-machine env $MACHINE_NAME-1)

docker network create -d overlay traefik-public
