#!/usr/bin/env bash

set -xeo pipefail

# upgrade & install packages, install postgres (sets up a postgres service)
apt-get update && apt-get upgrade --force-yes && apt-get -y install postgresql postgresql-contrib unzip

# install deno
curl -fsSL https://deno.land/x/install/install.sh | sh

export DENO_INSTALL="~/.deno"
export PATH="$DENO_INSTALL/bin:$PATH"

# git
git clone https://github.com/jchen1/api

# su - postgres
# createdb api
# run migrations...