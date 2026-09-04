#!/bin/sh

. "$(dirname "$0")/_setup.sh"

docs_dir=docs/_AI

rm -rf "${docs_dir}"

find * -name "_AI.md" -type f | while read -r file; do
    dest="${docs_dir}/${file}"
    mkdir -p "$(dirname "${dest}")"
    cp "${file}" "${dest}"
    echo "${docs_dir} < ${file}"
done
