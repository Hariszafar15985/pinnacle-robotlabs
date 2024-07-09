#!/usr/bin/env bash
PGPASSWORD=$POSTGRES_PASSWORD pg_dump -h db -U "$POSTGRES_USER" -F c -d "$POSTGRES_DB" > "$POSTGRES_DB".tar
