# Drizzle Schema Change Workflow

Plan a database schema change without generating or applying migration SQL.

## Arguments

`$ARGUMENTS` - schema change description, for example `add slug to scenarios`.

## Mandatory Research

Before coding, read at least 3 similar table/relation files in `src/db/schemas/**`. List the reference paths before editing.

## Workflow

1. Edit schema files in `src/db/schemas/**`.
2. Add required indexes, foreign keys, and native Drizzle `relations(...)`.
3. Update `src/db/schema.ts` exports if a new schema file was added.
4. Update domain schemas under `src/domains/**/schemas/**` when API payloads expose the changed DB shape.
5. Run `pnpm lint:typescript` and relevant tests when TypeScript behavior changed.
6. Tell the owner that migration generation is required and remains owner-only.

## Rules

- Do not run `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:seed`, or `pnpm db:studio` unless the owner explicitly asks for that exact command in the current task.
- Do not create, edit, or delete files under `src/db/migrations/**`.
- Do not rewrite old migrations.
- Report owner-only migration generation as a remaining step.

## Reference Examples

- Primary table with relations and indexes: `src/db/schemas/primary/scenario.ts`.
- Billing table with enum and partial unique index: `src/db/schemas/billing/subscription.ts`.
- Linking table with composite uniqueness: `src/db/schemas/linking/application-to-product-feature.ts`.
- Many-to-many linking table: `src/db/schemas/linking/scenario-to-platform.ts`.
- Schema barrel exports: `src/db/schema.ts`.
- Seed/default data wiring: `src/db/seed/config.ts` and matching `data/*.json` files.
