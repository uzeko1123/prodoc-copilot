#!/bin/sh

set -e

mkdir -p /config
cat > /config/s3.json << EOF
{
  "identities": [
    {
      "name": "admin",
      "credentials": [
        {
          "accessKey": "${AWS_ACCESS_KEY_ID}",
          "secretKey": "${AWS_SECRET_ACCESS_KEY}"
        }
      ],
      "actions": ["Admin", "Read", "Write", "List", "Tagging"]
    },
    {
      "name": "anonymous",
      "actions": ["Read"]
    }
  ]
}
EOF

exec /entrypoint.sh "$@"
