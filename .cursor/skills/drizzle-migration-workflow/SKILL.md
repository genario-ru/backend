---
name: drizzle-migration-workflow
description: Workflow for DB schema changes through Drizzle schema files, generated migrations, and application checks.
---

# Drizzle Migration Workflow

## When To Use

Use this when tables, fields, indexes, relations, or enums are changed in `src/db/schemas/**`.

## Steps

1. Inspect at least 3 relevant schemas/relations in `src/db/schemas/**`.
2. Do not run database-apply commands. Agents may generate migration SQL but must not apply it.
3. Apply schema changes in `src/db/schemas/**` and update `src/db/schema.ts` exports if required.
4. Update domain entity/handler schemas under `src/domains/**` when API payloads expose changed DB fields.
5. Generate migration: `pnpm db:generate`.
6. Inspect generated SQL for unintended drops, table rewrites, wrong defaults, or missing indexes.
7. Run project checks, at least `pnpm lint:typescript`; add tests when behavior changes.
8. Tell the user which migration file was generated and that a human should apply it if appropriate.

## Constraints

- Do not run `pnpm db:migrate` or `pnpm db:seed` unless the user explicitly asks for that exact command in the current task. There is no `db:push` — all schema changes go through reviewable migrations.
- Do not rewrite older migrations if it breaks migration history order.

## Production migrations & seed

- The runtime image has no `drizzle-kit`, so migrations run programmatically via `src/entrypoints/migrate.ts` (`dist/migrate.js`, drizzle's `migrate()`), exposed as `pnpm db:migrate` and executed at the deploy stage. SQL files are copied into the image at `src/db/migrations` (`Dockerfile`); a one-shot `migrate` service in `docker-compose.yml` runs them before `server`/`workers`.
- Default/reference data lives in `data/*.json`; seed runner in `src/db/seed/**`, invoked via `src/entrypoints/seed.ts` (`pnpm db:seed`, local). Idempotent upsert by `id` (`onConflictDoUpdate`). New default-data table: add `data/<table>.json` + an entry in `src/db/seed/config.ts` (referenced tables before dependents).

## Self-check

- Both schema change and migration file are present.
- No mismatch exists between schema code and SQL.
- API/domain schemas affected by the DB shape were updated.
