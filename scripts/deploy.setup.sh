#!/bin/sh

. "$(dirname "$0")/_setup.sh"

exit


### Env

GIT_REPOSITORY=https://github.com/uzeko1123/prodoc-copilot
GIT_BRANCH=dev
ENV_FILE=
CERTS_DIR=


### Install Git

apt-get update
apt-get install git


### Install Docker

# Uninstall all conflicting packages
apt remove $(dpkg --get-selections docker.io docker-compose docker-compose-v2 docker-doc docker-buildx podman-docker containerd runc | cut -f1)

# Add Docker's official GPG key:
apt update
apt install ca-certificates curl
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF

apt update

# Install the Docker packages:
apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin


### Setup

git clone "${GIT_REPOSITORY}" -b "${GIT_BRANCH}" app
cd app
cp "${ENV_FILE}" .env.prod
cp -r "${CERTS_DIR}" deploy/nginx/certs
sh scripts/deploy.update.sh "${GIT_BRANCH}"
