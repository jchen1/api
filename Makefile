.PHONY: infra setup start-db start build prod

infra:
	env $$(grep -v '^#' .env | xargs) terraform apply apiserver/infra/terraform

setup:
	brew bundle
	deno install --allow-read --allow-run --allow-write --allow-net -f -q --unstable https://deno.land/x/denon@2.5.0/denon.ts

start-db:
	brew services start postgresql > /dev/null

start:
	PATH=~/.deno/bin:$$PATH denon run --allow-read --allow-env --allow-net apiserver/src/index.ts
	
prod:
	git pull && docker pull jeffchen94/api:latest && systemctl daemon-reload && systemctl restart apiserver.service && journalctl -u apiserver.service -f

build:
	docker build apiserver -t jeffchen94/api

build_and_push: build
	docker push jeffchen94/api:latest
