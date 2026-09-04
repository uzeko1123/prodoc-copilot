#!/bin/sh

. "$(dirname "$0")/_setup.sh"

docker compose -f compose.prod.yml up -d --build
