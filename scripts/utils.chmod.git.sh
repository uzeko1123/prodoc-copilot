#!/bin/sh

. "$(dirname "$0")/_setup.sh"

git ls-files "*.sh" | xargs git add --chmod=+x
