---
name: drizzle-migration-workflow
description: Step-by-step workflow for DB schema changes via Drizzle with migration generation and application. Use for any change in src/db/schemas.
---

# Drizzle Migration Workflow

## When To Use

When tables, fields, indexes, relations, or enums are changed in `src/db/schemas/**`.

## Steps

1. Verify target DB (`POSTGRES_URL`) and environment context.
2. Apply schema changes in `src/db/schemas/**`.
3. Generate migration: `pnpm db:generate`.
4. Apply migration: `pnpm db:migrate`.
5. Ensure migration correctly reflects schema changes.
6. Run project checks (at least TypeScript + ESLint).
7. Commit schema and migrations together.

## Constraints

- Do not use `db:push` as the primary workflow for repository changes.
- Do not rewrite older migrations if it breaks migration history order.

## Self-check

- Both schema change and migration file are present.
- Migrations apply locally without errors.
- No mismatch between schema code and SQL.
