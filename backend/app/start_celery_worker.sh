#! /usr/bin/env bash
until PGPASSWORD=${POSTGRES_PASSWORD} psql -h db -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q'; do
  >&2 echo "Postgresql is unavailable - sleeping"
  sleep 3
done

celery -A robotlab purge -f
celery -A robotlab worker -l info --pidfile=
