#!/bin/sh

. "$(dirname "$0")/_setup.sh"

"${PYTHON}" -m mypy .
