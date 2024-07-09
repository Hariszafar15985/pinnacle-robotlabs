#! /usr/bin/env bash

echo "Running inside /app/prestart.sh, you could add migrations to this file, e.g.:"

cd /app || exit

# I am thinking about what we should do with the django migrations.
# we have too options:
# + create local migration files then commit migration the files
# + ignore migration files then makemirations on productions

python manage.py makemigrations

python manage.py migrate
