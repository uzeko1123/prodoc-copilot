#!/bin/sh

cd "$(dirname "$(readlink -f "$0")")/.." || exit

PYTHON="./.venv/Scripts/python"
