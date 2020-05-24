.PHONY: infra setup start-db start start-frontend build prod

infra:
	env $$(grep -v '^#' .env | xargs) terraform apply apiserver/infra/terraform

setup:
	brew bundle
	deno install --allow-read --allow-run --allow-write -f --unstable https://deno.land/x/denon/denon.ts

start-db:
	brew services start postgresql > /dev/null

start-frontend:
	NEXT_PUBLIC_WS_URL=ws://localhost:9001 yarn --cwd frontend dev

start-backend:
	PATH=~/.deno/bin:$$PATH denon run --allow-read --allow-env --allow-net apiserver/src/index.ts

start: start-db
	make -j2 start-frontend start-backend

build:
	NEXT_PUBLIC_WS_URL=wss://api.jeffchen.dev:444 yarn --cwd frontend export

prod: build
	git pull && systemctl daemon-reload && systemctl restart apiserver.service && journalctl -u apiserver.service -f
