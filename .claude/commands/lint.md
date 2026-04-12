# Lint and Type-check

Run the full validation suite for the current state of the backend.

## Steps

Run in order (each step must pass before the next):

```bash
pnpm lint:fix
```

Runs ESLint + Prettier auto-fix. Fixes auto-fixable issues in place.

```bash
pnpm lint:typescript
```

Runs `tsc --noEmit`. Must complete with zero errors.

## If DB schemas were changed

```bash
pnpm db:generate && pnpm db:migrate
```

Required after any change in `src/db/schemas/**`. Always commit schema + migration together.

## If external API specs were updated

```bash
pnpm api:download:tochka   # or api:download:yookassa
pnpm api:generate
```

Required when Tochka or YooKassa OpenAPI specs changed. Never edit `src/codegen/**` manually.

## Common issues

- **Zod imported from `"zod"`** → change to `import { z } from "@/lib/zod"`
- **`any` type** → use `unknown` with narrowing, or the correct Drizzle/Zod inferred type
- **Response not parsed** → wrap in `responseSchema.parse({ data })`
- **`c.req.param()` instead of `c.req.valid()`** → add `validator(...)` middleware before the handler
- **Worker not typed** → add explicit `JobData` type to `Queue<JobData>` and `Worker<JobData>`
- **Codegen types changed** → run `/regenerate-api` and adapt handwritten code
