#!/bin/sh

set -e

mkdir -p /config
cat > /config/nginx.conf << EOF
client_max_body_size 100m;

server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    return 444;
}

server {
    listen 443 ssl default_server;
    listen [::]:443 ssl default_server;
    server_name _;

    ssl_reject_handshake on;
}

server {
    listen 80;
    listen [::]:80;
    server_name localhost;

    location = /healthz {
        access_log off;
        default_type text/plain;
        return 200 OK;
    }
}

server {
    listen 80;
    listen [::]:80;
    server_name ${NGINX_SERVER_NAME};

    location = /healthz {
        access_log off;
        default_type text/plain;
        return 200 OK;
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name ${NGINX_SERVER_NAME};
    ssl_certificate /config/certs/${NGINX_SERVER_NAME}.cert;
    ssl_certificate_key /config/certs/${NGINX_SERVER_NAME}.key;

    location /api/ {
        proxy_pass ${DJANGO_URL};
        proxy_redirect off;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Host \$server_name;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /events/ {
        proxy_pass ${DJANGO_URL};
        proxy_redirect off;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Host \$server_name;
        proxy_set_header X-Forwarded-Proto \$scheme;

        proxy_http_version 1.1;
        proxy_set_header Connection '';
        proxy_buffering off;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

    location /ws/ {
        proxy_pass ${DJANGO_URL};
        proxy_redirect off;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Host \$server_name;
        proxy_set_header X-Forwarded-Proto \$scheme;

        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection upgrade;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

    location /storage/ {
        proxy_pass ${AWS_S3_ENDPOINT_URL}/${AWS_STORAGE_BUCKET_NAME}/;
    }

    location = /healthz {
        access_log off;
        default_type text/plain;
        return 200 OK;
    }

    location / {
        root /app/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOF

mkdir -p /etc/nginx/conf.d
ln -sf /config/nginx.conf /etc/nginx/conf.d/default.conf

exec /docker-entrypoint.sh "$@"
