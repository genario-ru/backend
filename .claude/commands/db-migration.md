# Drizzle Schema Change Workflow

Plan and implement a database schema change including migration generation.

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
6. Run `pnpm db:generate` and commit generated files under `src/db/migrations/**`.

## Rules

- Do not run `pnpm db:migrate`, `pnpm db:seed`, or `pnpm db:studio` unless the owner explicitly asks for that exact command in the current task.
- Do not manually rewrite or delete old migrations if it breaks migration history order.
- Migration application is deploy-stage only.

## Reference Examples

- Primary table with relations and indexes: `src/db/schemas/primary/scenario.ts`.
- Billing table with enum and partial unique index: `src/db/schemas/billing/subscription.ts`.
- Linking table with composite uniqueness: `src/db/schemas/linking/application-to-product-feature.ts`.
- Many-to-many linking table: `src/db/schemas/linking/scenario-to-platform.ts`.
- Schema barrel exports: `src/db/schema.ts`.
- Seed/default data wiring: `src/db/seed/config.ts` and matching `data/*.json` files.
