# New Backend Domain

Scaffold a backend domain with routes, schemas, and optional DB/MQ pieces.

## Arguments

`$ARGUMENTS` - domain name and responsibility.

## Mandatory Research

Find a comparable domain and inspect:

- `src/routes/api/v1/<similar-domain>/**`
- `src/domains/<similar-domain>/**`
- relevant DB schemas in `src/db/schemas/**`
- relevant workers in `src/mq/**` if background processing is needed

List the references before editing.

## Layout

Domain code usually spans:

- `src/domains/<domain>/schemas/entities/**` for entity schemas;
- `src/domains/<domain>/schemas/handlers/<handler-name>/**` for handler schemas;
- `src/routes/api/v1/<domain>/**` for Hono routes;
- `src/db/schemas/**` when new persistent tables are needed;
- `src/mq/**` when async work is needed.

## Workflow

1. Start with schemas and route skeletons that match local precedent.
2. Add DB schema only when persistence is required. Run `pnpm db:generate` when schema files change.
3. Add MQ queue/worker only when work should be asynchronous.
4. Register routes in `src/entrypoints/server.ts`.
5. Register queues in Bull Board and workers in `src/entrypoints/workers.ts`.
6. Run the validation matrix for all touched areas.

## Finish Checklist

- Domain files are in the real backend layout, not `src/schemas`.
- Routes are exported and registered.
- DB schema changes include required indexes/relations and generated migration SQL from `pnpm db:generate`.
- Workers have queue registration and shutdown handling.
- Validation commands and skipped checks are reported.

## Reference Examples

- Simple catalog-like domain: `src/routes/api/v1/product-features/**`, `src/domains/product-features/**`, `src/db/schemas/primary/product-feature.ts`.
- Domain with write route and linking table: `src/routes/api/v1/applications/**`, `src/domains/applications/**`, `src/db/schemas/primary/application.ts`, `src/db/schemas/linking/application-to-product-feature.ts`.
- Domain with async generation: `src/routes/api/v1/scenarios/**`, `src/domains/scenarios/**`, `src/mq/scenario-metadata-generation/**`, `src/db/schemas/primary/scenario.ts`.
- Route registration: `src/entrypoints/server.ts`.
- Worker registration: `src/entrypoints/workers.ts`.
