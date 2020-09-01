#!/usr/bin/env bash

set -xeo pipefail

# upgrade & install packages, install postgres (sets up a postgres service)
apt-get update && apt-get install software-properties-common && apt-add-repository universe
apt-get update && apt-get upgrade --force-yes && apt-get -y install certbot postgresql postgresql-contrib unzip nginx docker docker.io

# install deno
curl -fsSL https://deno.land/x/install/install.sh | sh

export DENO_INSTALL="~/.deno"
export PATH="$DENO_INSTALL/bin:$PATH"

# install denon
deno install --allow-read --allow-run --allow-write --allow-net -f -q --unstable https://deno.land/x/denon@2.3.2/denon.ts

# git
# git clone https://github.com/jchen1/api

# todo...
# su - postgres
# createdb api
# run migrations...

# softlink services
rm /etc/nginx/nginx.conf

ln -s apiserver/infra/nginx.conf /etc/nginx/nginx.conf

ln -s apiserver/infra/docker.service /etc/systemd/system/docker.service
ln -s apiserver/infra/apiserver.service /etc/systemd/system/apiserver.service

systemctl daemon-reload
systemctl enable docker.service
systemctl start docker.service

systemctl enable apiserver.service
systemctl start apiserver.service
systemctl restart nginx.service