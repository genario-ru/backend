# Lint And Type Check

Run backend validation appropriate to the changed areas.

## Baseline

```bash
pnpm lint:fix
pnpm lint:typescript
```

## Additional Checks

- Env changes: `pnpm validate:env` when a representative `.env` is available.
- Build/runtime entrypoints: `pnpm build`.
- DB schema changes: run `pnpm lint:typescript` when schema TypeScript changed. Do not run `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:seed`, or `pnpm db:studio` unless the owner explicitly asks for that exact command in the current task.
- External API codegen: provider download script when relevant, then `pnpm api:generate`.
- Tests changed or behavior covered by tests: `pnpm test:unit`, targeted Vitest, or `pnpm test`.

## Common Fixes

- Direct `zod` import should become `@/lib/zod`, except in `env.ts`.
- Route inputs should come from `c.req.valid(...)` after `validator(...)`.
- Responses should pass through `responseSchema.parse({ data })`.
- Generated code under `src/codegen/api/**` should not be hand-edited.
- BullMQ jobs need typed payloads and shutdown registration.

If a check cannot run because of credentials, services, or DB safety, report that explicitly.

## Reference Examples

- Exact validation scripts: `package.json`.
- Shared validation matrix: `AGENTS.md`.
- Route/Bull Board registration checks: `src/entrypoints/server.ts`.
- Worker shutdown checks: `src/entrypoints/workers.ts`.
- Env validation inputs: `env.ts`, `.env.example`, `docker-compose.yml`.
