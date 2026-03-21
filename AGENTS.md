# AGENTS Guide For Backend

This file defines project context for AI agents and serves as an architecture entry point.

## Project Context

- Stack: TypeScript, Hono, Drizzle ORM, BullMQ, Zod, Kubb codegen.
- Entrypoints:
  - `src/entrypoints/server.ts` - HTTP API + docs + Bull Board.
  - `src/entrypoints/workers.ts` - background workers and shutdown.
- Main areas:
  - `src/routes/` - API handlers.
  - `src/schemas/` - request/response and OpenAPI schemas.
  - `src/db/` - DB schemas and migrations.
  - `src/mq/` - queue/worker modules.
  - `src/lib/` - infrastructure integrations.

## Common Commands

- API watch mode: `pnpm dev`
- Workers watch mode: `pnpm dev:workers`
- Build: `pnpm build`
- TypeScript check: `pnpm lint:typescript`
- ESLint: `pnpm lint:eslint`
- Prettier: `pnpm lint:prettier`
- Migrations: `pnpm db:generate && pnpm db:migrate`
- Codegen: `pnpm api:download:tochka && pnpm api:download:yookassa && pnpm api:generate`

## Change Rules

- For API changes, follow `.cursor/rules/backend-route-pattern.mdc`.
- For queue/worker changes, follow `.cursor/rules/backend-mq-pattern.mdc`.
- For DB changes, follow `.cursor/rules/backend-db-and-migrations.mdc`.
- For codegen changes, follow `.cursor/rules/backend-codegen-openapi.mdc`.
- For global standards, follow `.cursor/rules/backend-core.mdc`.
- For task finalization, follow `.cursor/rules/backend-change-validation.mdc`.
- For new files in domain folders, follow `.cursor/rules/backend-reference-first.mdc`.

## Quick Task Paths

- New endpoint:
  1. schema in `src/schemas/entities/...`,
  2. route in `src/routes/v1/...`,
  3. registration in `src/entrypoints/server.ts`.
- New worker:
  1. `src/mq/<domain>/<feature>/queue.ts` and `worker.ts`,
  2. registration in `src/entrypoints/workers.ts`,
  3. queue registration in Bull Board inside `src/entrypoints/server.ts`.
- New env variable:
  1. `src/schemas/common/envs.ts`,
  2. `src/constants/common/envs.ts`,
  3. `docker-compose.yml` and `Dockerfile`,
  4. `.env.example`.

## Recommended Skills

- New endpoint: `.cursor/skills/add-api-endpoint/SKILL.md`
- New worker: `.cursor/skills/add-bullmq-worker/SKILL.md`
- DB schema change: `.cursor/skills/drizzle-migration-workflow/SKILL.md`
- OpenAPI/codegen: `.cursor/skills/openapi-codegen-kubb/SKILL.md`
- New env variable: `.cursor/skills/env-propagation-checklist/SKILL.md`
- Validation selection: `.cursor/skills/change-validation-matrix/SKILL.md`

## Related Documents

- Architecture map: `docs/architecture/backend-modules.md`
- Development checklists: `docs/workflows/development-checklists.md`
- Verification matrix: `docs/workflows/verification-matrix.md`
- Repeatable workflows: `.cursor/skills/*/SKILL.md`
