#!/bin/sh

. "$(dirname "$0")/_setup.sh"

"${PYTHON}" -m celery -A backend beat -S django_celery_beat.schedulers:DatabaseScheduler
