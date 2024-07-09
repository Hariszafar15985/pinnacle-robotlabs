#! /usr/bin/env bash
until PGPASSWORD=${POSTGRES_PASSWORD} psql -h db -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q'; do
  >&2 echo "Postgresql is unavailable - sleeping"
  sleep 3
done

>&2 echo "Postgresql is up - executing command"

echo "Running inside /app/start.sh, you could add migrations to this file, e.g.:"

cd /app || exit

echo "Running uvicorn"
exec python manage.py runserver 0.0.0.0:8000
