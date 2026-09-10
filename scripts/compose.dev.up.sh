#!/bin/sh

. "$(dirname "$0")/_setup.sh"

docker compose -f compose.dev.yml up -d --build
