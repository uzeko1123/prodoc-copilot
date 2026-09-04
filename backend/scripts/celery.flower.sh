#!/bin/sh

. "$(dirname "$0")/_setup.sh"

"${PYTHON}" -m celery -A backend flower
