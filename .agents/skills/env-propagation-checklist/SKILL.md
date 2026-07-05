---
name: env-propagation-checklist
description: Use when adding, renaming, or removing backend environment variables.
---

# Env Propagation Checklist

Update every relevant layer for env changes:

1. Decide whether the variable is required, optional, runtime, or build-time.
2. Add validation and `process.env` mapping in `env.ts`. Direct `zod` import is allowed here because `@t3-oss/env-core` expects it.
3. Update `.env.example` with a realistic example or clear empty value.
4. Add runtime variables to both `server` and `workers` in `docker-compose.yml`.
5. Update `Dockerfile` only for build-time variables such as release metadata.
6. Search usages to ensure names and casing match.
7. Run `pnpm validate:env` when a representative `.env` is available; otherwise report why it was skipped.

Do not add runtime env usage that bypasses `env.ts`.

## Reference Examples

- Validation and defaults: `env.ts`.
- Example values and required names: `.env.example`.
- Runtime propagation for both backend processes: `docker-compose.yml`.
- Build-time env/release metadata: `Dockerfile`.
