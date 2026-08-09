#!/bin/bash
set -e

# Общий Postgres-контейнер по умолчанию создаёт только $POSTGRES_DB (chetka_db).
# WMS-сервису нужна отдельная база chetka_wms — создаём её тут же при первом старте.
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-SQL
    SELECT 'CREATE DATABASE chetka_wms OWNER $POSTGRES_USER'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'chetka_wms')\gexec
SQL
