.PHONY: help dev build typecheck lint \
        infra-up infra-down infra-logs infra-reset \
        db-migrate db-generate db-studio db-reset \
        test-e2e install clean

# Exibe os comandos disponíveis
help:
	@grep -E '^[a-zA-Z_-]+:.*?##' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}' | sort

# ------------------------------------------------------------
# Desenvolvimento
# ------------------------------------------------------------

dev: ## Sobe API + Web em modo watch (turbo)
	pnpm dev

dev-api: ## Sobe apenas a API em modo watch
	pnpm --filter api dev

dev-web: ## Sobe apenas o Next.js em modo watch
	pnpm --filter web dev

build: ## Compila todos os pacotes
	pnpm build

typecheck: ## Verifica tipos em todos os pacotes
	pnpm typecheck

lint: ## Roda o linter em todos os pacotes
	pnpm lint

install: ## Instala dependências
	pnpm install

clean: ## Remove artefatos de build
	find . -name "dist" -not -path "*/node_modules/*" -exec rm -rf {} + 2>/dev/null; \
	find . -name ".next" -not -path "*/node_modules/*" -exec rm -rf {} + 2>/dev/null; \
	echo "Artefatos removidos."

# ------------------------------------------------------------
# Infraestrutura (Docker)
# ------------------------------------------------------------

infra-up: ## Sobe Postgres + MinIO em background
	docker compose up -d

infra-down: ## Para e remove os containers
	docker compose down

infra-logs: ## Exibe logs dos containers em tempo real
	docker compose logs -f

infra-reset: ## Destrói volumes e recria containers do zero
	docker compose down -v
	docker compose up -d

# ------------------------------------------------------------
# Banco de dados (Prisma)
# ------------------------------------------------------------

db-migrate: ## Cria e aplica uma nova migration (NAME= obrigatório)
	@if [ -z "$(NAME)" ]; then \
		echo "Uso: make db-migrate NAME=nome_da_migration"; exit 1; \
	fi
	pnpm --filter api exec prisma migrate dev --name $(NAME)

db-deploy: ## Aplica migrations pendentes (prod/CI)
	pnpm --filter api exec prisma migrate deploy

db-generate: ## Regenera o Prisma Client
	pnpm --filter api exec prisma generate

db-studio: ## Abre o Prisma Studio no browser
	pnpm --filter api exec prisma studio

db-reset: ## Reseta o banco e reaplica todas as migrations
	pnpm --filter api exec prisma migrate reset --force

db-seed: ## Executa o seed (se existir)
	pnpm --filter api exec prisma db seed

# ------------------------------------------------------------
# Testes
# ------------------------------------------------------------

test-e2e: ## Roda os testes end-to-end com Playwright
	pnpm test:e2e

test-e2e-ui: ## Abre a UI do Playwright
	pnpm exec playwright test --ui

# ------------------------------------------------------------
# Setup inicial completo
# ------------------------------------------------------------

setup: install infra-up db-deploy db-generate ## Prepara o ambiente do zero (install + infra + banco)
	@echo ""
	@echo "Ambiente pronto. Rode 'make dev' para iniciar."
