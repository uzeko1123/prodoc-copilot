#!/bin/sh

. "$(dirname "$0")/_setup.sh"

"${PYTHON}" manage.py migrate
