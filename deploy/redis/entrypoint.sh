#!/bin/sh

set -e

mkdir -p /config
cat > /config/redis.conf << EOF
user default off
user ${REDIS_USER} on >${REDIS_PASSWORD} ~* &* +@all
EOF

exec docker-entrypoint.sh "$@"
