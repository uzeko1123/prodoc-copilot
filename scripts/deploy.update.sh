#!/bin/sh

. "$(dirname "$0")/_setup.sh"

git_branch=${1:-dev}

git fetch origin
git checkout -f "${git_branch}"
git reset --hard "origin/${git_branch}"
git clean -df

sh scripts/version.update.sh
sh scripts/compose.prod.up.sh
