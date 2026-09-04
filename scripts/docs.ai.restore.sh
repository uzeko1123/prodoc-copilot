#!/bin/sh

. "$(dirname "$0")/_setup.sh"

docs_dir=docs/_AI

[ -d "${docs_dir}" ] || exit

find "${docs_dir}" -name "_AI.md" -type f | while read -r file; do
    dest="${file#"${docs_dir}/"}"
    mkdir -p "$(dirname "${dest}")"
    cp "${file}" "${dest}"
    echo "${docs_dir} > ${file}"
done
