#!/bin/sh

set -e

export PGPASSWORD=${POSTGRES_PASSWORD}
export REDISCLI_AUTH=${REDIS_PASSWORD}

cat > /app/backup.sh << EOF
#!/bin/sh

DATE=\$(date +%Y%m%d_%H%M%S)

set -x

mkdir -p /app/backup/\${DATE}

pg_dump -h ${POSTGRES_HOST} -p ${POSTGRES_PORT} -U ${POSTGRES_USER} -d ${POSTGRES_DB} -F c -f /app/backup/\${DATE}/postgres.dump
redis-cli -h ${REDIS_HOST} -p ${REDIS_PORT} --user ${REDIS_USER} --rdb /app/backup/\${DATE}/redis.rdb
tar -czf /app/backup/\${DATE}/seaweedfs.tar.gz -C /app/seaweedfs_data .

find /app/backup -mindepth 1 -maxdepth 1 -type d -mtime +${BACKUP_KEEP_DAYS} -exec rm -rf {} +
EOF

chmod +x /app/backup.sh && . /app/backup.sh
echo "${BACKUP_CRON_SCHEDULE} /app/backup.sh > /proc/1/fd/1 2>&1" >> /etc/crontabs/root

exec "$@"
