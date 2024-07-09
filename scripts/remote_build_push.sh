SERVICE=$1
set -e
source setstage

docker-compose -f docker-compose.deploy.build.yml -f docker-compose.deploy.images.yml config > docker-stack.yml

docker-compose -f docker-stack.yml build
if [ "$SERVICE" == "frontend" ] || [ "$SERVICE" == "" ]; then
    docker-compose -f docker-stack.yml push frontend
fi
if [ "$SERVICE" == "backend" ] || [ "$SERVICE" == "" ]; then
    docker-compose -f docker-stack.yml push backend
fi

echo "========== DONE ============="