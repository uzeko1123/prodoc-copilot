#!/bin/sh

. "$(dirname "$0")/_setup.sh"

find * -type f -name "*.sh" -exec chmod +x {} +
