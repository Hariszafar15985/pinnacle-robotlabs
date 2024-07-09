read -p "Are you sure? " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Y]$ ]]
then
  exit 1
fi

PGPASSWORD=$POSTGRES_PASSWORD psql -h db -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "drop schema public cascade;"
PGPASSWORD=$POSTGRES_PASSWORD psql -h db -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "create schema public;"
PGPASSWORD=$POSTGRES_PASSWORD pg_restore -h db -U "$POSTGRES_USER" -d "$POSTGRES_DB" "$POSTGRES_DB".tar --verbose
