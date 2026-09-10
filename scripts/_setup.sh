#!/bin/sh

cd "$(dirname "$(readlink -f "$0")")/.." || exit

MKCERT=.bin/mkcert
