# AGENTS.md - Genario Backend

This is the canonical working guide for coding agents in `genario-backend`.
Tool-specific files may add workflow detail, but they must not contradict this
file.

## Project Snapshot

- TypeScript ESM backend.
- HTTP framework: Hono, served from `src/entrypoints/server.ts`.
- Worker runtime: BullMQ, started from `src/entrypoints/workers.ts`.
- Auth: Better Auth integration in root `auth.ts` plus API routes under
  `src/routes/api/v1/auth/**`.
- Database: Drizzle ORM with PostgreSQL schema in `src/db/**` and migrations in
  `src/db/migrations/**`.
- Validation/OpenAPI: Zod 4, `hono-openapi`, response schemas, and OpenAPI
  metadata.
- External API clients: Kubb-generated code for Tochka, YooKassa, and Rutube in
  `src/codegen/api/**`.
- AI prompts: Markdown templates, typed props, and builders under
  `src/ai/prompts/**`.
- Tests: Vitest unit/integration scripts are defined in `package.json`.

## Source Of Truth

Read these before making non-trivial changes:

- `package.json` for exact scripts and dependency versions.
- `env.ts`, `.env.example`, `docker-compose.yml`, and sometimes `Dockerfile`
  for environment propagation.
- `drizzle.config.ts` and `src/db/**` for database changes.
- `kubb.config.ts` and `scripts/download-*-openapi.ts` for external API codegen.
- `src/entrypoints/server.ts` for route and Bull Board registration.
- `src/entrypoints/workers.ts` for worker registration and shutdown.
- `.cursor/rules/**`, `.agents/skills/**`, and `.claude/**` for scoped agent
  workflows.

If documentation disagrees with code/config, trust code/config first, then
update the documentation in the same change.

## Source Layout

| Path              | Purpose                                                       |
| ----------------- | ------------------------------------------------------------- |
| `src/entrypoints` | Process entrypoints: HTTP server and workers                  |
| `src/routes`      | Hono route modules and route indexes                          |
| `src/domains`     | Domain schemas, services, constants, and utilities            |
| `src/db`          | Drizzle client, schema, relations, migrations, DB utilities   |
| `src/mq`          | BullMQ queues, workers, job types, worker utilities           |
| `src/ai`          | AI providers, prompt templates, prompt builders, prompt types |
| `src/lib`         | External integrations and infrastructure adapters             |
| `src/middleware`  | Hono middleware                                               |
| `src/shared`      | Cross-domain constants, schemas, types, and utilities         |
| `src/codegen`     | Generated external API clients, read-only                     |
| `src/globals`     | Global `.d.ts` declarations                                   |
| `tests`           | Vitest unit and integration tests                             |

## Placement Rules

Use this before creating files:

1. HTTP endpoint or route index? Use `src/routes/**`.
2. Request/response/entity schema for product API? Use
   `src/domains/<domain>/schemas/**`.
3. Domain business service or domain-specific utility? Use `src/domains/<domain>`.
4. Table schema, relation, migration, or DB-only helper? Use `src/db/**`.
5. Queue, worker, job payload, or job-specific utility? Use `src/mq/**`.
6. External service adapter, client wrapper, S3/PDF/DOCX/email/provider code? Use
   `src/lib/**`.
7. Cross-domain primitive, generic API utility, or shared error/response schema?
   Use `src/shared/**`.
8. AI prompt template, builder, type, provider, or interpolation helper? Use
   `src/ai/**`.

Before creating new files in route/domain/db/mq/lib/ai areas, inspect at least 3
similar local implementations and follow their structure.

## Route Pattern

Routes usually have:

- colocated route module under `src/routes/api/v1/<domain>/.../<method>/route.ts`;
- matching schemas under
  `src/domains/<domain>/schemas/handlers/<handler-name>/`;
- export from a nearby `index.ts`;
- registration in `src/entrypoints/server.ts`.

Use:

- `createHonoApp().basePath(...)`;
- `validator("param" | "query" | "json", schema)` for inputs;
- `openAPIResponseMiddleware(...)` with `createOpenAPIResponse(...)`;
- `throwAPIError(...)` for domain/API errors;
- `responseSchema.parse(...)` before `c.json(...)`.

Typical protected route middleware order:

```text
sessionMiddleware -> rateLimitMiddleware -> subscriptionMiddleware -> openAPIResponseMiddleware -> validator
```

Public routes may omit auth/subscription middleware when existing local routes
do the same.

## Database And Migrations

- Schema source lives in `src/db/schemas/**`, re-exported through
  `src/db/schema.ts`.
- Migrations are generated into `src/db/migrations/**`.
- For schema changes, agents may run `pnpm db:generate` to create a migration
  file.
- Do not run `pnpm db:migrate`, `pnpm db:push`, `pnpm db:drop`, or any command
  that applies schema changes to a database unless the user explicitly asks for
  that exact command in the current task.
- Commit schema and migration files together.
- If a migration should be applied, stop after generation and tell the user what
  was generated and what command a human can run.
- If tables are exposed through API responses, update domain entity schemas in
  `src/domains/<domain>/schemas/entities/**`.

## BullMQ Workers

Each queue/workflow should keep the local paired structure used in `src/mq/**`:

- `queue.ts` for `Queue`, queue name, payload type, enqueue function;
- `worker.ts` for `Worker` processing;
- optional `types.ts` and `utils.ts` when local precedent supports it.

After adding a queue/worker:

- import and register the worker in `src/entrypoints/workers.ts`;
- close the worker in `shutdown()`;
- register the queue in Bull Board in `src/entrypoints/server.ts`;
- use shared Redis from `@/lib/redis`;
- keep queue name, job name, payload type, and worker data consistent.

## External API Codegen

Generated folders:

```text
src/codegen/api/tochka/**
src/codegen/api/yookassa/**
src/codegen/api/rutube/**
```

Do not edit generated code manually. Update source specs/config/scripts, then
run generators.

Use:

```bash
pnpm api:download:tochka
pnpm api:download:yookassa
pnpm api:generate
```

Rutube currently has `deps/api/rutube.json` and generated output, but no
download script in `package.json`. Treat it as a pinned local spec unless a task
explicitly changes that workflow.

## Environment Variables

When adding or changing an env variable, check all relevant points:

- `env.ts` validation schema;
- `.env.example` documentation;
- `docker-compose.yml` for both `server` and `workers` services;
- `Dockerfile` only when the variable is a build arg or build-time env, for
  example `GLITCHTIP_RELEASE`.

Do not add runtime env usage without validation in `env.ts`.

## AI Prompt Work

Prompt workflows usually have three files:

- `src/ai/prompts/templates/<name>.md`;
- `src/ai/prompts/types/<name>.ts`;
- `src/ai/prompts/builders/<name>.ts`.

Use `interpolate(...)` with explicit variables and `buildContextLines(...)` for
optional context blocks. Keep template placeholders synchronized with builder
variables. If editing Russian examples or messages, preserve correct UTF-8 text
and do not introduce mojibake.

## Zod Imports

Use `@/lib/zod` for project schemas. `env.ts` is the known exception because it
uses `@t3-oss/env-core` directly with `zod`.

## Commands

```bash
pnpm dev
pnpm dev:workers
pnpm validate:env
pnpm build
pnpm start
pnpm start:workers
pnpm test
pnpm test:unit
pnpm test:integration
pnpm lint:fix
pnpm lint:typescript
pnpm db:generate
pnpm db:push # human-only; AI agents must not run this by default
pnpm db:studio # human-only/local inspection
pnpm api:download:tochka
pnpm api:download:yookassa
pnpm api:generate
```

## Validation Matrix

Choose checks by changed area:

- TypeScript/backend code: `pnpm lint:fix`, `pnpm lint:typescript`.
- Env config: `pnpm validate:env` when a representative `.env` is available.
- Build/runtime entrypoints: `pnpm build`.
- Route/API contract: `pnpm lint:typescript`, targeted tests if available, and
  inspect OpenAPI metadata.
- DB schema: `pnpm db:generate` only. Do not apply migrations to a database.
- External API codegen: relevant `api:download:*`, `pnpm api:generate`,
  TypeScript check.
- Tests changed or behavior covered by tests: `pnpm test:unit` or targeted
  Vitest command; `pnpm test` when broader validation is needed.

If a check cannot be run because it requires real services, credentials, or a
dangerous database target, state that explicitly.

## Completion Checklist

Before finishing, report:

- files changed;
- local reference files inspected;
- route/worker/env/db/codegen registration points updated;
- generated files or migration SQL produced, if any;
- validation commands run and their result;
- validation skipped, if any, with the reason.
