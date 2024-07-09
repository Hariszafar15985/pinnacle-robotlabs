set -e
source setstage

DOMAIN=${DOMAIN} \
TRAEFIK_TAG=${TRAEFIK_TAG} \
STACK_NAME=${STACK_NAME} \
TAG=${TAG-latest} \

docker-compose \
-f docker-compose.shared.admin.yml \
-f docker-compose.deploy.command.yml \
-f docker-compose.deploy.images.yml \
-f docker-compose.deploy.labels.yml \
-f docker-compose.deploy.networks.yml \
-f docker-compose.deploy.volumes-placement.yml \
-f docker-compose.shared.env.yml \
config > docker-stack.yml

docker stack deploy -c docker-stack.yml --with-registry-auth "${STACK_NAME}" --prune

sleep 1
docker stack ps -f "desired-state=running" "${STACK_NAME}"

cd docker-swarm-monitor
docker stack deploy -c docker-compose.stack.yml "${STACK_NAME}"
cd ..

echo "========== DONE ============="