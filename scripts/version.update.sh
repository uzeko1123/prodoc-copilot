#!/bin/sh

. "$(dirname "$0")/_setup.sh"

project_version=$(cat "VERSION" 2>/dev/null || echo "dev")

for dir in frontend backend deploy/*; do
    [ -d "${dir}" ] || continue
    git_info=$(git log -1 --format="%cd.%h" --date=format:"%Y%m%d" -- "${dir}" 2>/dev/null)
    [ -n "${git_info}" ] && service_version="${project_version}+${git_info}" || service_version="${project_version}"
    echo "${service_version}" > "${dir}/VERSION"
    echo "${service_version} > ${dir}/VERSION"
done
