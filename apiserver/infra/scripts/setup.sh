#!/usr/bin/env bash

set -xeo pipefail

# upgrade & install packages, install postgres (sets up a postgres service)
apt-get update && apt-get install software-properties-common && apt-add-repository universe
apt-get update && apt-get upgrade --force-yes && apt-get -y install certbot postgresql postgresql-contrib unzip

# install deno
curl -fsSL https://deno.land/x/install/install.sh | sh

export DENO_INSTALL="~/.deno"
export PATH="$DENO_INSTALL/bin:$PATH"

# install denon
deno install --allow-read --allow-run --allow-write -f --unstable https://deno.land/x/denon/denon.ts

# git
git clone https://github.com/jchen1/api

# todo...
# su - postgres
# createdb api
# run migrations...


# setup & start systemd service

cat <<EOF > /etc/systemd/system/apiserver.service
[Unit]
Description=ApiServer
Documentation=https://github.com/jchen1/api

[Service]
Environment=HOME=/root
WorkingDirectory=/root/api
ExecStart=/root/.deno/bin/deno run --allow-read --allow-env --allow-net apiserver/src/index.ts
Restart=always
LimitNOFILE=1048576
LimitNPROC=1048576

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable apiserver.service
systemctl start apiserver.service