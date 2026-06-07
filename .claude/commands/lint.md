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
- DB schema changes: `pnpm db:generate` only. Do not run `pnpm db:migrate` or `pnpm db:seed` unless the user explicitly asks for that exact command in the current task.
- External API codegen: provider download script when relevant, then `pnpm api:generate`.
- Tests changed or behavior covered by tests: `pnpm test:unit`, targeted Vitest, or `pnpm test`.

## Common Fixes

- Direct `zod` import should become `@/lib/zod`, except in `env.ts`.
- Route inputs should come from `c.req.valid(...)` after `validator(...)`.
- Responses should pass through `responseSchema.parse({ data })`.
- Generated code under `src/codegen/api/**` should not be hand-edited.
- BullMQ jobs need typed payloads and shutdown registration.

If a check cannot run because of credentials, services, or DB safety, report that explicitly.
