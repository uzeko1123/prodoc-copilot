#!/bin/sh

set -e

export POSTGRES_USER=${POSTGRES_USER}
export POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
export POSTGRES_DB=${POSTGRES_DB}

mkdir -p /config
cat > /config/postgresql.conf << EOF
include = '${PGDATA}/postgresql.conf'
EOF

exec docker-entrypoint.sh "$@"
