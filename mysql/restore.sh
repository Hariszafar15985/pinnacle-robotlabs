read -p "Are you sure? " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Y]$ ]]
then
  exit 1
fi

PGPASSWORD=$POSTGRES_PASSWORD psql -h db -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "drop schema public cascade; create schema public;"
PGPASSWORD=$POSTGRES_PASSWORD psql --set ON_ERROR_STOP=on -h db -U "$POSTGRES_USER" -d "$POSTGRES_DB" -1 -f "$POSTGRES_DB".sql
