.PHONY: infra setup start-db start

infra:
	env $$(grep -v '^#' .env | xargs) terraform apply infra/terraform

setup:
	brew bundle
	deno install --allow-read --allow-run --allow-write -f --unstable https://deno.land/x/denon/denon.ts

start-db:
	brew services start postgresql > /dev/null

start: start-db
	PATH=~/.deno/bin:$$PATH denon run --allow-read --allow-env --allow-net src/index.ts