#!/bin/sh

. "$(dirname "$0")/_setup.sh"

domain=${1:-localhost}

mkdir -p deploy/nginx/certs

"${MKCERT}" -cert-file "deploy/nginx/certs/${domain}.cert" -key-file "deploy/nginx/certs/${domain}.key" "${domain}"
