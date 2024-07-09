#! /usr/bin/env bash
#! /usr/bin/env bash
until PGPASSWORD=${POSTGRES_PASSWORD} psql -h db -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q'; do
  >&2 echo "Postgresql is unavailable - sleeping"
  sleep 3
done

>&2 echo "Postgresql is up - executing celery beat"
celery -A robotlab beat --pidfile= --scheduler django_celery_beat.schedulers:DatabaseScheduler
