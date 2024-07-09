#!/bin/bash
# bugging with newest docker version (20.04)

export AMI="ami-927185ef"
echo "Aws"
echo "Creating swarm-master"
docker-machine create --driver amazonec2 \
                        --amazonec2-open-port 80 \
                        --amazonec2-open-port 443 \
                        --amazonec2-open-port 2377 \
                        --amazonec2-open-port 2376 \
                        --amazonec2-open-port 7946 \
                        --amazonec2-open-port 4789 \
                        --amazonec2-instance-type "t3.medium" \
                        --amazonec2-vpc-id $AWS_VPC \
                        --amazonec2-access-key $AWS_ACCESS_KEY_ID \
                        --amazonec2-secret-key $AWS_SECRET_ACCESS_KEY\
                        --amazonec2-root-size 160 \
                        --amazonec2-ami $AMI \
                        --engine-install-url "https://releases.rancher.com/install-docker/19.03.9.sh" \
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
                        --amazonec2-instance-type "t3.xlarge" \
                        --amazonec2-vpc-id $AWS_VPC \
                        --engine-install-url "https://releases.rancher.com/install-docker/19.03.9.sh" \
                        --amazonec2-access-key $AWS_ACCESS_KEY_ID \
                        --amazonec2-secret-key $AWS_SECRET_ACCESS_KEY\
                        --amazonec2-root-size 160 \
                        --amazonec2-ami $AMI \
                        --swarm \
                        --amazonec2-region us-east-1 $MACHINE_NAME-2

#docker-machine ssh $MACHINE_NAME-1 -- docker swarm init --advertise-addr $(docker-machine ip $MACHINE_NAME-1)
#eval $(docker-machine env $MACHINE_NAME-1)
#docker network create -d overlay traefik-public
