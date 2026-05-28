# Amigo Animal

Sistema de gestão interna para ONGs de proteção animal. Permite que voluntários cadastrem e acompanhem animais disponíveis para adoção, registrem adotantes e seus animais, e organizem eventos da ONG — tudo em uma interface web centralizada.

> Projeto acadêmico desenvolvido para a PUC.

---

## Funcionalidades

- **Animais** — cadastro completo com foto, espécie, porte, raça, status (disponível / adotado / em tratamento), lar temporário e anexos
- **Adotantes** — cadastro com foto, contato e gerenciamento dos animais adotados diretamente na página do adotante, incluindo data e local de adoção
- **Eventos** — criação de eventos públicos ou privados com data, local e descrição
- **Autenticação** — login com JWT (access token em memória + refresh token em cookie HttpOnly com rotação automática)
- **Integração com Google Maps** — todos os campos de endereço e local abrem o Maps ao clicar
- **Upload de arquivos** — fotos e anexos enviados diretamente ao MinIO pelo browser via presigned URLs

---

## Stack

| Camada | Tecnologia |
|---|---|
| Monorepo | pnpm workspaces + Turborepo |
| Frontend | Next.js 14 (App Router) + React 18 |
| Backend | Fastify 4 + TypeScript |
| Banco de dados | PostgreSQL 16 + Prisma ORM |
| Armazenamento | MinIO (S3-compatible) |
| Validação compartilhada | Zod (`packages/shared`) |
| Estilização | Tailwind CSS + Lucide Icons |
| Formulários | React Hook Form + Zod resolvers |
| Requisições | TanStack React Query (Axios) |
| Testes E2E | Playwright |
| Infra local | Docker Compose |

---

## Estrutura do projeto

```
ong_amigo_animal/
├── apps/
│   ├── api/          # Backend Fastify
│   │   ├── prisma/   # Schema e migrations
│   │   └── src/
│   │       └── modules/   # animals, adopters, events, auth
│   └── web/          # Frontend Next.js
│       └── src/
│           ├── app/       # Páginas (App Router)
│           ├── components/
│           ├── hooks/     # React Query hooks
│           └── lib/       # api client, queryClient, maps helper
├── packages/
│   └── shared/       # Schemas Zod e tipos TypeScript compartilhados
├── e2e/              # Testes Playwright
├── docker-compose.yml
└── Makefile
```

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) >= 9
- [Docker](https://www.docker.com/) + Docker Compose

---

## Como rodar

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo e ajuste se necessário:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local
```

As variáveis padrão já funcionam com o Docker Compose local sem nenhuma alteração.

### 3. Subir a infraestrutura (Postgres + MinIO)

```bash
make infra-up
```

### 4. Aplicar as migrations e gerar o Prisma Client

```bash
make db-deploy
make db-generate
```

### 5. Iniciar os servidores de desenvolvimento

```bash
make dev
```

| Serviço | URL |
|---|---|
| Frontend (Next.js) | http://localhost:3000 |
| Backend (API) | http://localhost:3001 |
| MinIO Console | http://localhost:9001 |

---

## Setup completo em um comando

```bash
make setup && make dev
```

---

## Comandos úteis

```bash
make dev              # Sobe API + Web em modo watch
make infra-up         # Sobe Postgres e MinIO
make infra-down       # Para os containers
make db-migrate NAME=nome   # Cria nova migration
make db-studio        # Abre o Prisma Studio
make test-e2e         # Roda os testes Playwright
make help             # Lista todos os comandos disponíveis
```

---

## Rotas da API

| Método | Rota | Descrição |
|---|---|---|
| POST | `/v1/auth/register` | Cadastrar usuário |
| POST | `/v1/auth/login` | Login |
| POST | `/v1/auth/logout` | Logout |
| POST | `/v1/auth/refresh` | Renovar access token |
| GET/POST | `/v1/animals` | Listar / criar animais |
| GET/PATCH/DELETE | `/v1/animals/:id` | Detalhar / editar / excluir animal |
| GET/POST | `/v1/adopters` | Listar / criar adotantes |
| GET/PATCH/DELETE | `/v1/adopters/:id` | Detalhar / editar / excluir adotante |
| POST | `/v1/adopters/:id/animals` | Vincular animal ao adotante |
| PATCH | `/v1/adopters/:id/animals/:animalId` | Atualizar vínculo (data / local) |
| DELETE | `/v1/adopters/:id/animals/:animalId` | Remover vínculo |
| GET/POST | `/v1/events` | Listar / criar eventos |
| GET/PATCH/DELETE | `/v1/events/:id` | Detalhar / editar / excluir evento |
