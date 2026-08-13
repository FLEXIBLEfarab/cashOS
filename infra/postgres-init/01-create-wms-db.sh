#!/bin/bash
set -e

# ╨₧╨▒╤ë╨╕╨╣ Postgres-╨║╨╛╨╜╤é╨╡╨╣╨╜╨╡╤Ç ╨┐╨╛ ╤â╨╝╨╛╨╗╤ç╨░╨╜╨╕╤Ä ╤ü╨╛╨╖╨┤╨░╤æ╤é ╤é╨╛╨╗╤î╨║╨╛ $POSTGRES_DB (chetka_db).
# WMS-╤ü╨╡╤Ç╨▓╨╕╤ü╤â ╨╜╤â╨╢╨╜╨░ ╨╛╤é╨┤╨╡╨╗╤î╨╜╨░╤Å ╨▒╨░╨╖╨░ chetka_wms ΓÇö ╤ü╨╛╨╖╨┤╨░╤æ╨╝ ╨╡╤æ ╤é╤â╤é ╨╢╨╡ ╨┐╤Ç╨╕ ╨┐╨╡╤Ç╨▓╨╛╨╝ ╤ü╤é╨░╤Ç╤é╨╡.
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-SQL
    SELECT 'CREATE DATABASE chetka_wms OWNER $POSTGRES_USER'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'chetka_wms')\gexec
SQL
