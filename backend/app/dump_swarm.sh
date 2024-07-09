container=$(docker container ls --filter "name=robotlab_backend" | grep robotlab_backend.1 | awk '{print $1}')

echo "Got container ID ${container}"

docker exec "${container}" bash /app/dump_db.sh

docker cp "${container}":/app/robotlab.tar ./

echo "=== DONE ===="
